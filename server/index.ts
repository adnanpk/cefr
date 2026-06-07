import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Lazy-load optional integrations to avoid startup crashes when keys are absent
let anthropicClient: import('@anthropic-ai/sdk').default | null = null;
let resendClient: import('resend').Resend | null = null;

(async () => {
  if (process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
})();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    anthropic: !!anthropicClient,
    resend: !!resendClient,
    timestamp: new Date().toISOString(),
  });
});

// ── Speaking grading ──────────────────────────────────────────────────────────
app.post('/api/speaking/grade', upload.single('audio'), async (req, res) => {
  const transcript: string = req.body.transcript || '';
  const promptText: string = req.body.prompt || '';
  const promptTitle: string = req.body.promptTitle || '';

  // Graceful fallback when no API key is configured
  if (!anthropicClient) {
    res.json({
      cefrBand: 'B1',
      score: 5,
      feedback: 'AI grading is not configured (no ANTHROPIC_API_KEY). This is a placeholder result. Add your API key to .env to enable real grading.',
      breakdown: {
        grammar: 'Requires AI evaluation — configure ANTHROPIC_API_KEY.',
        vocabulary: 'Requires AI evaluation — configure ANTHROPIC_API_KEY.',
        coherence: 'Requires AI evaluation — configure ANTHROPIC_API_KEY.',
        taskAchievement: 'Requires AI evaluation — configure ANTHROPIC_API_KEY.',
      },
    });
    return;
  }

  if (!transcript.trim()) {
    res.json({
      cefrBand: 'A1',
      score: 1,
      feedback: 'No speech was detected or transcribed for this response.',
      breakdown: {
        grammar: 'No speech detected.',
        vocabulary: 'No speech detected.',
        coherence: 'No speech detected.',
        taskAchievement: 'No speech detected.',
      },
    });
    return;
  }

  try {
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a certified CEFR language examiner assessing a spoken English response.

Speaking Task (${promptTitle}):
"${promptText}"

Candidate's Spoken Response (transcribed):
"${transcript}"

Assess this response strictly against the official CEFR speaking descriptors for:
1. Grammatical Range and Accuracy
2. Lexical Resource (Vocabulary breadth, precision, paraphrase ability)
3. Coherence and Cohesion (Logical flow, discourse markers, linking)
4. Task Achievement (Relevance, elaboration, meeting prompt requirements)

Assign an overall CEFR band (A1, A2, B1, B2, C1, or C2) and a numeric score from 1–10.

Be precise. If the transcript is minimal or incoherent, award a low band. If it is fluent, structured, and lexically rich, award a high band.

Respond ONLY with valid JSON — no markdown fences, no preamble:
{
  "cefrBand": "B2",
  "score": 7,
  "feedback": "Overall assessment paragraph here...",
  "breakdown": {
    "grammar": "Specific comment on grammatical range and accuracy...",
    "vocabulary": "Specific comment on lexical resource...",
    "coherence": "Specific comment on coherence and cohesion...",
    "taskAchievement": "Specific comment on task achievement..."
  }
}`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}';
    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error('[speaking/grade] Error:', err);
    res.status(500).json({ error: 'AI grading failed', message: String(err) });
  }
});

// ── Email helpers ─────────────────────────────────────────────────────────────
interface EmailPayload {
  candidateData: {
    name: string;
    email?: string;
    startedAt: string;
    completedAt: string;
  };
  results: {
    overall: string;
    modules: Record<string, { band: string; score: string }>;
    speakingTranscripts?: { prompt: string; transcript: string; band: string; feedback: string }[];
  };
}

function buildEmailHtml(payload: EmailPayload): string {
  const { candidateData: c, results: r } = payload;
  const moduleRows = Object.entries(r.modules)
    .map(
      ([mod, data]) =>
        `<tr>
          <td style="padding:8px 12px;text-transform:capitalize;font-weight:500;border-bottom:1px solid #f1f5f9;">${mod}</td>
          <td style="padding:8px 12px;font-weight:700;color:#1d4ed8;border-bottom:1px solid #f1f5f9;">${data.band}</td>
          <td style="padding:8px 12px;color:#64748b;border-bottom:1px solid #f1f5f9;">${data.score}</td>
        </tr>`
    )
    .join('');

  const speakingSection = r.speakingTranscripts
    ? r.speakingTranscripts
        .map(
          (p, i) =>
            `<div style="margin-top:12px;padding:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
              <p style="margin:0 0 6px;font-weight:700;color:#374151;">Prompt ${i + 1}: ${p.prompt.slice(0, 80)}…</p>
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;font-style:italic;">"${p.transcript || 'No transcript recorded.'}"</p>
              <p style="margin:0;font-size:13px;color:#1e40af;"><strong>Band:</strong> ${p.band} — ${p.feedback}</p>
            </div>`
        )
        .join('')
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>CEFR Assessment Report</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
<div style="max-width:600px;margin:32px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f2744,#1d4ed8);padding:28px 32px;">
    <h1 style="margin:0;color:white;font-size:22px;font-weight:800;">CEFR Assessment Report</h1>
    <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">Dr. ARS Assessment Platform</p>
  </div>

  <div style="padding:28px 32px;">
    <!-- Candidate info -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="color:#64748b;font-size:13px;padding:3px 0;">Candidate</td><td style="font-weight:600;font-size:14px;">${c.name}</td></tr>
      ${c.email ? `<tr><td style="color:#64748b;font-size:13px;padding:3px 0;">Email</td><td style="font-size:14px;">${c.email}</td></tr>` : ''}
      <tr><td style="color:#64748b;font-size:13px;padding:3px 0;">Started</td><td style="font-size:14px;">${new Date(c.startedAt).toLocaleString()}</td></tr>
      <tr><td style="color:#64748b;font-size:13px;padding:3px 0;">Completed</td><td style="font-size:14px;">${new Date(c.completedAt).toLocaleString()}</td></tr>
    </table>

    <!-- Overall band -->
    <div style="text-align:center;padding:20px;background:linear-gradient(135deg,#1e3a5f,#1d4ed8);border-radius:12px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#bfdbfe;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Overall CEFR Band</p>
      <p style="margin:0;color:#fbbf24;font-size:52px;font-weight:900;">${r.overall}</p>
    </div>

    <!-- Module table -->
    <h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#1e293b;">Module Results</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Module</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Band</th>
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Score</th>
        </tr>
      </thead>
      <tbody>${moduleRows}</tbody>
    </table>

    <!-- Speaking transcripts -->
    ${speakingSection ? `<h2 style="font-size:16px;font-weight:700;margin:0 0 12px;color:#1e293b;">Speaking Transcripts & Feedback</h2>${speakingSection}` : ''}
  </div>

  <!-- Footer -->
  <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#64748b;">
      Prepared by <strong>Dr. Adnan Rashid Sheikh</strong> · <a href="mailto:arsheikh540@gmail.com" style="color:#2563eb;">arsheikh540@gmail.com</a>
    </p>
    <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;">Dr. ARS Assessment Platform · CEFR A1–C2 Framework</p>
  </div>
</div>
</body></html>`;
}

// ── Auto admin report ─────────────────────────────────────────────────────────
app.post('/api/email/admin', async (req, res) => {
  const payload = req.body as EmailPayload;

  if (!resendClient) {
    res.json({ success: false, message: 'Email service not configured (no RESEND_API_KEY).' });
    return;
  }

  try {
    const html = buildEmailHtml(payload);
    await resendClient.emails.send({
      from: `${process.env.FROM_NAME || 'Dr. ARS Assessment'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: process.env.ADMIN_EMAIL || 'arsheikh540@gmail.com',
      subject: `CEFR Results: ${payload.candidateData.name} — ${payload.results.overall}`,
      html,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[email/admin] Error:', err);
    res.status(500).json({ success: false, message: String(err) });
  }
});

// ── User-requested report ─────────────────────────────────────────────────────
app.post('/api/email/user', async (req, res) => {
  const { email, ...payload } = req.body as { email: string } & EmailPayload;

  if (!resendClient) {
    res.json({ success: false, message: 'Email service not configured (no RESEND_API_KEY).' });
    return;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ success: false, message: 'Invalid email address.' });
    return;
  }

  try {
    const html = buildEmailHtml(payload);
    await resendClient.emails.send({
      from: `${process.env.FROM_NAME || 'Dr. ARS Assessment'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: email,
      subject: `Your CEFR Assessment Results — ${payload.results.overall}`,
      html,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[email/user] Error:', err);
    res.status(500).json({ success: false, message: String(err) });
  }
});

// ── Static file serving (production) ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(join(distPath, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`\n🚀 CEFR Assessment Server running on http://localhost:${PORT}`);
  console.log(`   Anthropic AI: ${anthropicClient ? '✅ configured' : '⚠️  not configured (add ANTHROPIC_API_KEY to .env)'}`);
  console.log(`   Resend Email: ${resendClient ? '✅ configured' : '⚠️  not configured (add RESEND_API_KEY to .env)'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);
});
