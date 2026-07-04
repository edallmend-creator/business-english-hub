// ================================================================
// WOCHE 4 – Self-Explanation, Elaborative Interrogation, Framing, NYC Pitch
// ================================================================

// Self-Explanation + Elaborative Interrogation Konzepte
const W4_CONCEPTS = [
  { term: "scalable", de: "skalierbar", why: "Weil das System mehr Nutzer verarbeiten kann, ohne langsamer zu werden.", example: "Our platform is scalable – we went from 100 to 10,000 users without downtime.", impact: "Für Investoren: Wachstum ohne proportionale Kostenerhöhung.", why_not: "Why scalable and not just 'big'? Because scalable implies architecture, not just size." },
  { term: "leverage", de: "nutzen / hebeln", why: "Weil es nicht nur Ressourcen nutzt, sondern deren Wirkung multipliziert.", example: "We leverage our existing network to accelerate market entry.", impact: "Zeigt strategisches Denken, nicht nur operatives Handeln.", why_not: "Why leverage and not 'use'? Because leverage implies amplification – you get more out than you put in." },
  { term: "trade-off", de: "Abwägung / Kompromiss", why: "Weil zwei Faktoren in Konflikt stehen und man bewusst priorisiert.", example: "There's a trade-off between speed and quality here.", impact: "Zeigt analytisches Denken und Entscheidungskompetenz.", why_not: "Why trade-off and not 'problem'? Because it implies a deliberate choice, not a failure." },
  { term: "stakeholder alignment", de: "Abstimmung mit allen Beteiligten", why: "Weil alle relevanten Parteien dasselbe Ziel verstehen müssen.", example: "We need stakeholder alignment before the launch.", impact: "Verhindert Reibung und Projektverzögerungen später.", why_not: "Why alignment and not 'agreement'? Because alignment implies shared direction, not just consent." },
  { term: "due diligence", de: "sorgfältige Prüfung", why: "Weil vor einer Investitionsentscheidung alle Fakten geprüft werden müssen.", example: "We completed our due diligence – the numbers hold.", impact: "Schafft Vertrauen bei Investoren und Partnern.", why_not: "Why due diligence and not 'check'? Because it signals a formal, thorough process – not a casual look." },
  { term: "onboarding", de: "Einarbeitung / Einführung", why: "Weil neue Kunden oder Mitarbeiter systematisch eingeführt werden müssen.", example: "We can cut onboarding time by 18% this quarter.", impact: "Schnelleres Onboarding = schnellerer Umsatz.", why_not: "Why onboarding and not 'training'? Because onboarding is broader – it includes setup, culture, and process." },
  { term: "long-term positioning", de: "langfristige Positionierung", why: "Weil Marktposition durch strategische Entscheidungen über Zeit aufgebaut wird.", example: "This investment supports our long-term positioning in the European market.", impact: "Zeigt Weitsicht statt kurzfristiges Denken.", why_not: "Why positioning and not 'strategy'? Because positioning is visible to the market – it's how others see you." },
  { term: "currently vs. actually", de: "derzeit vs. eigentlich", why: "'Actually' bedeutet auf Englisch 'eigentlich' – ein klassischer False Friend.", example: "We are currently reviewing the proposal.", impact: "Verhindert peinliche Missverständnisse im internationalen Meeting.", why_not: "Why currently and not actually? Because 'actually' means 'eigentlich' in German – a classic false friend trap." },
];

// Framing-Übungen: neutral → wirkungsvoll
const W4_FRAMING = [
  { neutral: "The project is expensive.", framed: "This is a strategic investment that positions us ahead of competitors.", tip: "Teuer → Investition mit strategischem Vorteil" },
  { neutral: "We need more time.", framed: "Taking a bit more time now ensures higher quality and fewer corrections later.", tip: "Zeitbedarf → Qualitätssicherung" },
  { neutral: "This approach is risky.", framed: "This approach gives us the opportunity to gain a significant advantage.", tip: "Risiko → Chancenpotenzial" },
  { neutral: "The timeline feels rushed.", framed: "The timeline isn't a risk – it's a result. We've tested under worst-case conditions.", tip: "Zeitdruck → Beweis der Belastbarkeit (Jonas' Satz aus dem NYC-Pitch)" },
  { neutral: "The numbers are high.", framed: "Yes – because this covers full integration and support.", tip: "Hohe Kosten → Vollständige Lösung" },
  { neutral: "We don't have all the data yet.", framed: "We're working with the best available data and building in checkpoints.", tip: "Datenlücke → Agiles Vorgehen" },
  { neutral: "The market is competitive.", framed: "The market is active – which validates demand for exactly this solution.", tip: "Wettbewerb → Marktbestätigung" },
  { neutral: "We're a small team.", framed: "We're a focused team – every decision is made by the people doing the work.", tip: "Kleine Größe → Agilität und Verantwortung" },
];

// NYC Pitch Simulation Szenen
const NYC_PITCH_SCENES = [
  {
    scene: "Eröffnung – 27. Stock, Manhattan",
    setup: "Die Metalltüren gehen auf. Zwei Hände, ein knappes Lächeln. Der Lead-Investor fragt direkt:",
    investor: "So – what's your point? Give me one sentence.",
    hint: "1 Satz + 1 Zahl. Kein Einleiten. Jonas-Stil.",
    model: "We can cut onboarding time by 18% this quarter.",
    technique: "Chunking: 1 Satz, 1 Zahl, 1 klare Wirkung"
  },
  {
    scene: "Der Widerstand",
    setup: "Der Investor blättert durchs Memo. Er sieht auf:",
    investor: "It's a bold ask. The numbers are aggressive, and frankly, the timeline feels rushed.",
    hint: "Nicht verteidigen – umformulieren. Reframing.",
    model: "Let me reframe this, just to be clear. From our side, the urgency isn't pressure – it's proof.",
    technique: "Framing: 'Let me reframe…' + Perspektivwechsel"
  },
  {
    scene: "Die Nachfrage",
    setup: "Der CTO lehnt sich vor:",
    investor: "You said 'scalable' – what exactly do you mean by that?",
    hint: "Self-Explanation: Was? Beispiel? Wirkung?",
    model: "Scalable means the system can grow from 100 to 10,000 users without downtime. One client expanded last quarter – zero crashes.",
    technique: "Self-Explanation: Begriff → Beispiel → Beweis"
  },
  {
    scene: "Die Warum-Frage",
    setup: "Der Senior Partner schaut kurz von seinen Notizen auf:",
    investor: "Why this approach and not a phased rollout?",
    hint: "Elaborative Interrogation: Warum genau? Klarer Begründungssatz.",
    model: "Because a phased rollout delays the network effect. Full launch at once creates the critical mass we need.",
    technique: "Elaborative Interrogation: Warum X und nicht Y?"
  },
  {
    scene: "Der Abschluss",
    setup: "Stille. Alle schauen dich an. Der Investor sagt:",
    investor: "Alright. We're interested. What are your next steps?",
    hint: "Signposting + klarer Abschluss. Zwei Punkte, ein Recap.",
    model: "Two things. First, we'll send a one-pager by Thursday. Second, we'd suggest a 30-minute follow-up next week. So to recap: one-pager Thursday, call next week.",
    technique: "Signposting: Two things. First… Second… So to recap…"
  },
];

