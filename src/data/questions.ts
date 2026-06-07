import { MCQQuestion, SpeakingPrompt } from '../utils/types';

// ─── GRAMMAR  (12 questions · 2 per CEFR level A1→C2) ────────────────────────
export const grammarQuestions: MCQQuestion[] = [
  // ── A1 ──────────────────────────────────────────────────────────────────────
  {
    id: 101, cefrLevel: 'A1',
    text: 'I ___ a student at this university.',
    options: ['am', 'is', 'are', 'be'],
    correctIndex: 0,
    explanation: '"Am" is the only correct form of "to be" with the subject "I".',
  },
  {
    id: 102, cefrLevel: 'A1',
    text: 'There ___ three books on the table.',
    options: ['is', 'are', 'am', 'be'],
    correctIndex: 1,
    explanation: 'Plural noun "books" requires the plural verb form "are".',
  },

  // ── A2 ──────────────────────────────────────────────────────────────────────
  {
    id: 103, cefrLevel: 'A2',
    text: 'She usually ___ to work by bus, but today she is walking.',
    options: ['go', 'goes', 'went', 'is going'],
    correctIndex: 1,
    explanation: '"Goes" (simple present) is used for habitual actions. "Is going" describes only what is happening at this moment.',
  },
  {
    id: 104, cefrLevel: 'A2',
    text: 'They ___ dinner when the phone rang.',
    options: ['had', 'were having', 'have had', 'have been having'],
    correctIndex: 1,
    explanation: 'Past continuous "were having" describes an action in progress that was interrupted by a past simple event.',
  },

  // ── B1 ──────────────────────────────────────────────────────────────────────
  {
    id: 105, cefrLevel: 'B1',
    text: 'If it ___ tomorrow, we will cancel the outdoor event.',
    options: ['will rain', 'rains', 'rained', 'would rain'],
    correctIndex: 1,
    explanation: 'First conditional: the if-clause takes simple present ("rains"), not future or conditional.',
  },
  {
    id: 106, cefrLevel: 'B1',
    text: 'By the time she arrived, I ___ for over two hours.',
    options: ['was waiting', 'waited', 'have been waiting', 'had been waiting'],
    correctIndex: 3,
    explanation: 'Past perfect continuous "had been waiting" emphasises the duration of an activity completed before another past event.',
  },

  // ── B2 ──────────────────────────────────────────────────────────────────────
  {
    id: 107, cefrLevel: 'B2',
    text: 'He told me he ___ the report the following day.',
    options: ['will submit', 'submits', 'would submit', 'has submitted'],
    correctIndex: 2,
    explanation: 'Reported speech shifts future "will" → "would" when the reporting verb is past tense.',
  },
  {
    id: 108, cefrLevel: 'B2',
    text: 'The ancient bridge ___ by engineers before it reopened to traffic last spring.',
    options: ['was inspecting', 'was inspected', 'has been inspected', 'inspected'],
    correctIndex: 1,
    explanation: 'Past passive "was inspected" is required: the bridge received the action and the time reference ("last spring") is a specific past point.',
  },

  // ── C1 ──────────────────────────────────────────────────────────────────────
  {
    id: 109, cefrLevel: 'C1',
    text: 'The board insisted that the chief executive ___ a formal public statement.',
    options: ['issues', 'issued', 'issue', 'would issue'],
    correctIndex: 2,
    explanation: 'After mandative verbs (insist, recommend, demand), the subjunctive uses the bare infinitive — no -s, no auxiliary: "that he issue".',
  },
  {
    id: 110, cefrLevel: 'C1',
    text: 'Had the committee reviewed the proposal carefully, they ___ its flaws immediately.',
    options: ['would identify', 'will have identified', 'would have identified', 'had identified'],
    correctIndex: 2,
    explanation: 'Inverted third conditional: "Had + past participle" replaces "If + past perfect". The result clause uses "would have + past participle".',
  },

  // ── C2 ──────────────────────────────────────────────────────────────────────
  {
    id: 111, cefrLevel: 'C2',
    text: 'Not only ___ the solution, but he also presented a detailed implementation plan.',
    options: ['he found', 'he did find', 'did he find', 'found he'],
    correctIndex: 2,
    explanation: 'Fronting a negative adverbial ("Not only") obligatorily triggers subject–auxiliary inversion: "did he find".',
  },
  {
    id: 112, cefrLevel: 'C2',
    text: '___ the professor\'s warning about the difficulty of the final exam that students found most alarming.',
    options: ['It was', 'There was', 'That was', 'What was'],
    correctIndex: 0,
    explanation: 'Cleft sentence structure: "It was + focus element + that + clause" is the standard form for fronting emphasis in formal English.',
  },
];

// ─── VOCABULARY  (12 questions · 2 per CEFR level A1→C2) ─────────────────────
export const vocabularyQuestions: MCQQuestion[] = [
  // ── A1 ──────────────────────────────────────────────────────────────────────
  {
    id: 201, cefrLevel: 'A1',
    text: 'What do you call the room in a house where you sleep?',
    options: ['kitchen', 'bedroom', 'bathroom', 'garage'],
    correctIndex: 1,
    explanation: 'A "bedroom" is the room designated for sleeping.',
  },
  {
    id: 202, cefrLevel: 'A1',
    text: 'Which word means "not big"?',
    options: ['tall', 'small', 'heavy', 'loud'],
    correctIndex: 1,
    explanation: '"Small" is the direct antonym of "big". "Tall" refers to height, not size.',
  },

  // ── A2 ──────────────────────────────────────────────────────────────────────
  {
    id: 203, cefrLevel: 'A2',
    text: 'The word "annual" means happening every ___.',
    options: ['day', 'week', 'month', 'year'],
    correctIndex: 3,
    explanation: '"Annual" derives from Latin "annus" (year) — it describes something occurring once per year.',
  },
  {
    id: 204, cefrLevel: 'A2',
    text: 'Which word is the opposite of "difficult"?',
    options: ['hard', 'easy', 'boring', 'long'],
    correctIndex: 1,
    explanation: '"Easy" is the direct antonym of "difficult". "Hard" is a synonym, not an antonym.',
  },

  // ── B1 ──────────────────────────────────────────────────────────────────────
  {
    id: 205, cefrLevel: 'B1',
    text: 'After working twelve hours straight, she was completely ___ and could barely keep her eyes open.',
    options: ['refreshed', 'exhausted', 'energised', 'motivated'],
    correctIndex: 1,
    explanation: '"Exhausted" means extremely tired from prolonged effort — the only option consistent with the context.',
  },
  {
    id: 206, cefrLevel: 'B1',
    text: 'The new safety regulations are designed to ___ the risk of workplace accidents.',
    options: ['increase', 'ignore', 'reduce', 'create'],
    correctIndex: 2,
    explanation: '"Reduce" means to make smaller or less — safety regulations aim to lower risk, not increase it.',
  },

  // ── B2 ──────────────────────────────────────────────────────────────────────
  {
    id: 207, cefrLevel: 'B2',
    text: 'The board voted to ___ its contract with the supplier following repeated delivery failures.',
    options: ['renew', 'extend', 'terminate', 'negotiate'],
    correctIndex: 2,
    explanation: '"Terminate" means to bring something to a definitive end — the only option consistent with "failures" as the reason.',
  },
  {
    id: 208, cefrLevel: 'B2',
    text: 'Which word means "to make a bad situation considerably worse"?',
    options: ['alleviate', 'mitigate', 'exacerbate', 'resolve'],
    correctIndex: 2,
    explanation: '"Exacerbate" means to intensify or worsen. "Alleviate" and "mitigate" both mean to reduce or relieve.',
  },

  // ── C1 ──────────────────────────────────────────────────────────────────────
  {
    id: 209, cefrLevel: 'C1',
    text: 'The politician\'s speech was full of ___ — impressive-sounding language that ultimately lacked any real substance.',
    options: ['rhetoric', 'syntax', 'diction', 'prosody'],
    correctIndex: 0,
    explanation: '"Rhetoric" (in its pejorative sense) means empty or insincere persuasive language. Syntax, diction, and prosody refer to grammatical structure, word choice, and versification respectively.',
  },
  {
    id: 210, cefrLevel: 'C1',
    text: 'The researcher\'s conclusions were considered ___ because they directly contradicted the established scientific consensus.',
    options: ['orthodox', 'heterodox', 'canonical', 'conventional'],
    correctIndex: 1,
    explanation: '"Heterodox" means departing from accepted or established beliefs or standards. Its antonym is "orthodox".',
  },

  // ── C2 ──────────────────────────────────────────────────────────────────────
  {
    id: 211, cefrLevel: 'C2',
    text: 'His prose style was remarkably ___, conveying profound ideas in the absolute minimum of words.',
    options: ['verbose', 'laconic', 'prolix', 'grandiloquent'],
    correctIndex: 1,
    explanation: '"Laconic" means using very few words; it derives from the Spartans of Laconia, famous for terse speech. The other three options all describe overly wordy or pompous expression.',
  },
  {
    id: 212, cefrLevel: 'C2',
    text: 'His habitual ___ — passing moral judgement on others while excusing identical faults in himself — alienated those around him.',
    options: ['sycophancy', 'obsequiousness', 'sanctimony', 'magnanimity'],
    correctIndex: 2,
    explanation: '"Sanctimony" is a show of moral superiority or self-righteousness. "Sycophancy" is excessive flattery; "obsequiousness" is servility; "magnanimity" is generosity of spirit.',
  },
];

// ─── READING PASSAGES ─────────────────────────────────────────────────────────
const passageA = `Amsterdam is famous worldwide for its canals, world-class museums, and vibrant cycling culture. More than 800,000 bicycles are registered in the city — outnumbering the human population — and cycling is by far the most popular means of getting around. The city boasts over 500 kilometres of dedicated cycling paths, making it consistently ranked among the most bicycle-friendly cities on the planet. Many visitors choose to explore Amsterdam by bicycle, renting one from the numerous hire shops dotted throughout the city. The famously flat landscape makes cycling accessible and enjoyable even for complete beginners.`;

const passageB = `Remote work, once considered a perk reserved for a privileged few, has become a defining feature of the modern employment landscape. The COVID-19 pandemic accelerated this transformation dramatically, forcing organisations worldwide to adapt virtually overnight. While proponents argue that remote work enhances productivity and improves work-life balance, critics contend that it erodes company culture and impedes meaningful collaboration. Recent research, however, presents a more nuanced picture: productivity gains prove highly contingent on the nature of the work itself and the employee's domestic circumstances. Those with dedicated home offices and minimal domestic interruptions tend to flourish, while others struggle with chronic isolation and the blurring of boundaries between professional and personal life.`;

const passageC = `The concept of dark matter represents one of contemporary cosmology's most enduring enigmas. Comprising an estimated 27% of the universe's total mass-energy content yet emitting no detectable electromagnetic radiation, dark matter is inferred exclusively through its gravitational effects on visible matter. The rotational curves of galaxies, for instance, cannot be reconciled with the gravitational pull of their observable components alone; postulating the existence of a substantial unseen mass distribution is what brings theory into alignment with observation. Despite decades of increasingly sophisticated detection efforts — from deep-underground particle detectors to cutting-edge space-based telescopes — dark matter's precise nature remains obstinately elusive. Current leading candidates include weakly interacting massive particles (WIMPs) and axions, though neither has been directly confirmed. This persistent absence of direct detection has prompted a minority of physicists to question not dark matter's existence per se, but the very theoretical frameworks through which we model gravitational interactions at cosmological scales.`;

// ─── READING  (12 questions · 2 per CEFR level · 3 passages × 4 questions) ────
export const readingQuestions: MCQQuestion[] = [
  // ── Passage A (Amsterdam) — A1 × 2, A2 × 2 ──────────────────────────────────
  {
    id: 301, cefrLevel: 'A1', passageId: 'A', contextText: passageA,
    text: 'What is Amsterdam famous for, according to the passage?',
    options: [
      'Canals, museums and cycling',
      'Mountains and skiing',
      'Beaches and surfing',
      'Ancient castles',
    ],
    correctIndex: 0,
    explanation: 'The opening sentence lists "canals, world-class museums, and vibrant cycling culture".',
  },
  {
    id: 302, cefrLevel: 'A1', passageId: 'A', contextText: passageA,
    text: 'How many bicycles are registered in Amsterdam?',
    options: [
      'Exactly 500',
      'More than 800,000',
      'About one million',
      'Fewer than 100,000',
    ],
    correctIndex: 1,
    explanation: 'The passage states "More than 800,000 bicycles are registered in the city".',
  },
  {
    id: 303, cefrLevel: 'A2', passageId: 'A', contextText: passageA,
    text: 'According to the passage, what is the most popular way to travel around Amsterdam?',
    options: ['Walking', 'Cycling', 'Driving a car', 'Taking the tram'],
    correctIndex: 1,
    explanation: 'The passage says "cycling is by far the most popular means of getting around".',
  },
  {
    id: 304, cefrLevel: 'A2', passageId: 'A', contextText: passageA,
    text: 'Why is cycling easy in Amsterdam, according to the passage?',
    options: [
      'The city has excellent weather all year',
      'Bicycles are provided free to visitors',
      'The landscape is famously flat',
      'Cars are banned from the city centre',
    ],
    correctIndex: 2,
    explanation: 'The final sentence states "The famously flat landscape makes cycling accessible and enjoyable even for complete beginners".',
  },

  // ── Passage B (Remote Work) — B1 × 2, B2 × 2 ────────────────────────────────
  {
    id: 305, cefrLevel: 'B1', passageId: 'B', contextText: passageB,
    text: 'What event dramatically accelerated the widespread shift to remote work?',
    options: [
      'Advances in broadband technology',
      'Worker demands for flexibility',
      'The COVID-19 pandemic',
      'New government legislation',
    ],
    correctIndex: 2,
    explanation: 'The passage states "The COVID-19 pandemic accelerated this transformation dramatically".',
  },
  {
    id: 306, cefrLevel: 'B1', passageId: 'B', contextText: passageB,
    text: 'What do critics of remote work argue, according to the passage?',
    options: [
      'It always improves productivity',
      'It erodes company culture and impedes collaboration',
      'It is cheaper for employers',
      'It reduces commuting stress',
    ],
    correctIndex: 1,
    explanation: 'The passage says critics "contend that it erodes company culture and impedes meaningful collaboration".',
  },
  {
    id: 307, cefrLevel: 'B2', passageId: 'B', contextText: passageB,
    text: 'According to recent research, what most influences whether remote work boosts productivity?',
    options: [
      'The size of the company',
      'The worker\'s salary level',
      'The nature of the work and the employee\'s domestic circumstances',
      'The distance from the office',
    ],
    correctIndex: 2,
    explanation: 'The passage says "productivity gains prove highly contingent on the nature of the work itself and the employee\'s domestic circumstances".',
  },
  {
    id: 308, cefrLevel: 'B2', passageId: 'B', contextText: passageB,
    text: 'The word "nuanced" in the passage most nearly means:',
    options: [
      'Simple and straightforward',
      'Confusing and misleading',
      'Complex, showing subtle distinctions',
      'Overwhelmingly positive',
    ],
    correctIndex: 2,
    explanation: '"Nuanced" describes an analysis that acknowledges fine distinctions and complexity rather than presenting a simple picture.',
  },

  // ── Passage C (Dark Matter) — C1 × 2, C2 × 2 ────────────────────────────────
  {
    id: 309, cefrLevel: 'C1', passageId: 'C', contextText: passageC,
    text: 'How do scientists know that dark matter exists, according to the passage?',
    options: [
      'They have observed it directly using space telescopes',
      'They have confirmed it through WIMPs',
      'They infer it from its gravitational effects on visible matter',
      'They detected it using underground particle detectors',
    ],
    correctIndex: 2,
    explanation: 'The passage states dark matter "is inferred exclusively through its gravitational effects on visible matter".',
  },
  {
    id: 310, cefrLevel: 'C1', passageId: 'C', contextText: passageC,
    text: 'What does the passage say about WIMPs and axions?',
    options: [
      'Both have been directly confirmed',
      'Neither has been directly confirmed',
      'WIMPs have been confirmed; axions have not',
      'Both have been ruled out as candidates',
    ],
    correctIndex: 1,
    explanation: 'The passage explicitly states "neither has been directly confirmed".',
  },
  {
    id: 311, cefrLevel: 'C2', passageId: 'C', contextText: passageC,
    text: 'What is the most significant implication of the final sentence of the passage?',
    options: [
      'Scientists are abandoning the search for dark matter entirely',
      'Dark matter definitely does not exist',
      'Some physicists suspect that our models of gravity at cosmic scales may be incomplete',
      'WIMPs remain the most promising dark matter candidate',
    ],
    correctIndex: 2,
    explanation: 'The sentence says some physicists question "the very theoretical frameworks through which we model gravitational interactions at cosmological scales" — implying those models may be flawed.',
  },
  {
    id: 312, cefrLevel: 'C2', passageId: 'C', contextText: passageC,
    text: 'The phrase "obstinately elusive" suggests that dark matter is:',
    options: [
      'Easily found with the right instruments',
      'Deliberately hiding from scientists',
      'Persistently and stubbornly difficult to detect',
      'Only temporarily beyond our detection capability',
    ],
    correctIndex: 2,
    explanation: '"Obstinately" means stubbornly refusing to change; "elusive" means hard to find. Together they convey persistent, unyielding difficulty of detection.',
  },
];

// ─── LISTENING  (12 questions · 2 per CEFR level · 6 audio scripts) ──────────
const scriptA1 = 'Hello. My name is Tom. I am from London, in England. I am twenty-five years old. I work as a primary school teacher. I love my job very much.';

const scriptA2 = 'Excuse me, could you tell me how to get to the train station? — Yes, of course. Go straight ahead, then turn left at the traffic lights. The station is about a five-minute walk from there on your right.';

const scriptB1 = 'Good evening. Here is your weather forecast for tomorrow. The northern regions will experience heavy rainfall throughout the day, with temperatures dropping to around eight degrees Celsius. The southern areas will remain relatively dry, though some cloud cover is anticipated. Winds will be moderate, picking up slightly in coastal zones by the evening. Drivers are advised to exercise caution on mountain roads due to possible ice.';

const scriptB2 = 'Good afternoon, and thank you for attending today\'s town hall. We are here to discuss the proposed expansion of our public transportation network — specifically, the introduction of a new light rail line connecting the city centre with the eastern suburbs. This initiative is funded jointly by the municipal government and private investors, and is projected to reduce traffic congestion by approximately thirty percent over the next decade, while also significantly cutting carbon emissions. Some residents have raised legitimate concerns about construction noise and disruption to local businesses during the anticipated two-year building phase.';

const scriptC1 = 'The debate surrounding artificial intelligence in education is genuinely multifaceted. On one hand, adaptive learning platforms powered by machine learning can personalise instruction with unprecedented precision, identifying gaps in student understanding and adjusting content difficulty in real time. On the other hand, critics argue that an over-reliance on algorithmic systems risks undermining the relational dimensions of teaching — the mentoring, the intuition, the capacity to read a classroom\'s emotional temperature — that no algorithm has yet replicated. A balanced approach would involve deploying AI to handle routine assessment and content delivery, while preserving the human educator\'s central role in fostering critical thinking and social-emotional development.';

const scriptC2 = 'In what scholars of rhetoric term the post-truth era, the epistemic foundations upon which democratic deliberation depends appear increasingly precarious. The proliferation of algorithmically curated information environments — so-called filter bubbles — has not merely fragmented shared factual ground but has actively cultivated distinct and mutually irreconcilable realities for different segments of the population. This epistemological fracture poses challenges that transcend the merely political: it strikes at the very mechanisms by which citizens arrive at collective judgements. Some theorists propose that sustained institutional investment in media literacy — teaching citizens to interrogate sources, identify cognitive biases, and distinguish between empirical claims and normative assertions — represents the most viable long-term remedy.';

export const listeningQuestions: MCQQuestion[] = [
  // ── A1 ──────────────────────────────────────────────────────────────────────
  {
    id: 401, cefrLevel: 'A1', audioScript: scriptA1,
    text: 'Where is Tom from?',
    options: ['Paris', 'London', 'New York', 'Berlin'],
    correctIndex: 1,
    explanation: 'Tom says "I am from London, in England".',
  },
  {
    id: 402, cefrLevel: 'A1', audioScript: scriptA1,
    text: 'How old is Tom?',
    options: ['Twenty', 'Twenty-five', 'Thirty', 'Thirty-five'],
    correctIndex: 1,
    explanation: 'Tom says "I am twenty-five years old".',
  },

  // ── A2 ──────────────────────────────────────────────────────────────────────
  {
    id: 403, cefrLevel: 'A2', audioScript: scriptA2,
    text: 'Which direction should you turn at the traffic lights?',
    options: ['Right', 'Straight ahead', 'Left', 'Back the way you came'],
    correctIndex: 2,
    explanation: 'The directions say "turn left at the traffic lights".',
  },
  {
    id: 404, cefrLevel: 'A2', audioScript: scriptA2,
    text: 'How far is the train station from the traffic lights?',
    options: ['About one minute', 'About five minutes', 'About ten minutes', 'About fifteen minutes'],
    correctIndex: 1,
    explanation: 'The directions say "about a five-minute walk from there".',
  },

  // ── B1 ──────────────────────────────────────────────────────────────────────
  {
    id: 405, cefrLevel: 'B1', audioScript: scriptB1,
    text: 'What weather is expected in the northern regions tomorrow?',
    options: [
      'Sunshine and mild temperatures',
      'Heavy rainfall and cold temperatures',
      'Light snow and freezing winds',
      'Clear skies with moderate winds',
    ],
    correctIndex: 1,
    explanation: 'The forecast mentions "heavy rainfall throughout the day" with temperatures around "eight degrees Celsius" in the north.',
  },
  {
    id: 406, cefrLevel: 'B1', audioScript: scriptB1,
    text: 'What specific advice is given to drivers?',
    options: [
      'Avoid coastal roads entirely',
      'Use public transport instead',
      'Exercise caution on mountain roads',
      'Drive slowly in the southern areas',
    ],
    correctIndex: 2,
    explanation: 'The forecast concludes: "Drivers are advised to exercise caution on mountain roads due to possible ice".',
  },

  // ── B2 ──────────────────────────────────────────────────────────────────────
  {
    id: 407, cefrLevel: 'B2', audioScript: scriptB2,
    text: 'Who is funding the new light rail line?',
    options: [
      'The national government alone',
      'Private investors alone',
      'The municipal government and private investors jointly',
      'The European Union',
    ],
    correctIndex: 2,
    explanation: 'The speaker says "funded jointly by the municipal government and private investors".',
  },
  {
    id: 408, cefrLevel: 'B2', audioScript: scriptB2,
    text: 'By how much is traffic congestion projected to decrease?',
    options: ['Ten percent', 'Twenty percent', 'Twenty-five percent', 'Thirty percent'],
    correctIndex: 3,
    explanation: 'The speaker says "projected to reduce traffic congestion by approximately thirty percent".',
  },

  // ── C1 ──────────────────────────────────────────────────────────────────────
  {
    id: 409, cefrLevel: 'C1', audioScript: scriptC1,
    text: 'What balanced approach to AI in education does the speaker suggest?',
    options: [
      'Replacing human teachers entirely with AI systems',
      'Banning AI tools from all educational settings',
      'Using AI for routine tasks while keeping human educators central',
      'Restricting AI use to university-level courses only',
    ],
    correctIndex: 2,
    explanation: 'The speaker recommends "deploying AI to handle routine assessment and content delivery, while preserving the human educator\'s central role".',
  },
  {
    id: 410, cefrLevel: 'C1', audioScript: scriptC1,
    text: 'What does the speaker say no algorithm has yet managed to replicate?',
    options: [
      'Grading written essays efficiently',
      'Reading a classroom\'s emotional temperature',
      'Delivering content to students',
      'Tracking individual student progress over time',
    ],
    correctIndex: 1,
    explanation: 'The speaker cites "the capacity to read a classroom\'s emotional temperature — that no algorithm has yet replicated".',
  },

  // ── C2 ──────────────────────────────────────────────────────────────────────
  {
    id: 411, cefrLevel: 'C2', audioScript: scriptC2,
    text: 'What do some theorists propose as the most effective long-term solution?',
    options: [
      'Banning all social media platforms',
      'Government censorship of false information',
      'Sustained institutional investment in media literacy education',
      'Creating a single authoritative global news source',
    ],
    correctIndex: 2,
    explanation: 'The passage ends: "sustained institutional investment in media literacy... represents the most viable long-term remedy".',
  },
  {
    id: 412, cefrLevel: 'C2', audioScript: scriptC2,
    text: 'What does the term "filter bubble" refer to in this passage?',
    options: [
      'A technical tool for blocking online advertisements',
      'An algorithmically curated information environment that limits exposure to diverse viewpoints',
      'A government programme to regulate online content',
      'A type of encrypted social media platform',
    ],
    correctIndex: 1,
    explanation: 'The passage describes filter bubbles as "algorithmically curated information environments" that cultivate separate realities for different population groups.',
  },
];

// ─── SPEAKING PROMPTS (unchanged — graded by AI) ─────────────────────────────
export const speakingPrompts: SpeakingPrompt[] = [
  {
    id: 1,
    title: 'Personal Narrative',
    text: 'Describe a significant challenge you have faced in your life. How did you overcome it, and what did you learn from the experience?',
    guidance: 'Speak for 1–2 minutes. Use varied vocabulary and a range of grammatical structures including past tenses and reflective language.',
  },
  {
    id: 2,
    title: 'Discussion & Opinion',
    text: 'Technology has transformed almost every aspect of modern life. Do you think, on balance, it has made our lives better or worse? Discuss both sides and give your own clearly reasoned opinion with specific examples.',
    guidance: 'Speak for 1–2 minutes. Support your arguments with concrete reasons and examples. Show your ability to weigh different perspectives.',
  },
];

// ─── Helper map ───────────────────────────────────────────────────────────────
export const moduleQuestions: Record<string, MCQQuestion[]> = {
  grammar:    grammarQuestions,
  vocabulary: vocabularyQuestions,
  reading:    readingQuestions,
  listening:  listeningQuestions,
};
