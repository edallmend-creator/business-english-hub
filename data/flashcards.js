// ================================================================
// CARD_DECKS - Dynamisch aus CSVs geladen via Papa Parse
// Diese Datei existiert nur noch für Legacy-Decks (tone_cards etc.)
// Alle Core-Phrasen (Woche 1-4) werden jetzt on-demand geladen!
// ================================================================

// Globales CARD_DECKS Objekt (wird dynamisch gefüllt)
const CARD_DECKS = {};

// ================================================================
// LEGACY DECKS - Diese bleiben hardcoded
// (Ton & Grammatik, Woche 4 Konzepte, etc.)
// ================================================================

// Ton & Grammatik – Hedging & Signposting (Woche 2)
CARD_DECKS.tone_cards = [
  {
    q: "We should implement this immediately.",
    a: "Das sollten wir sofort umsetzen.",
    options: [
      { text: "I'd like to suggest we implement this relatively soon.", correct: true, explanation: "Höflich + Hedging (relatively soon)" },
      { text: "We must implement this now, no discussion.", correct: false, explanation: "Zu direkt und fordernd" },
      { text: "Maybe we could think about implementing this someday.", correct: false, explanation: "Zu vage, kein Commitment" }
    ]
  },
  {
    q: "Your proposal doesn't work.",
    a: "Dein Vorschlag funktioniert nicht.",
    options: [
      { text: "I see where you're going, though we might face challenges with X.", correct: true, explanation: "Anerkennung + konstruktive Kritik" },
      { text: "That proposal is completely unrealistic.", correct: false, explanation: "Zu harsch" },
      { text: "Maybe there's something we could improve a tiny bit.", correct: false, explanation: "Zu schwammig, verschleiert das Problem" }
    ]
  },
  {
    q: "The budget is too high.",
    a: "Das Budget ist zu hoch.",
    options: [
      { text: "If I may, the budget seems a bit above what we initially discussed.", correct: true, explanation: "Höflich + Hedging (a bit)" },
      { text: "This budget is way over the top and not acceptable.", correct: false, explanation: "Zu direkt" },
      { text: "The budget could potentially be re-evaluated at some point.", correct: false, explanation: "Zu passiv" }
    ]
  },
  {
    q: "Let's discuss the next steps.",
    a: "Lassen Sie uns die nächsten Schritte besprechen.",
    options: [
      { text: "Before we move on, could we quickly align on the next steps?", correct: true, explanation: "Signposting (before we move on)" },
      { text: "Next steps now.", correct: false, explanation: "Zu abrupt" },
      { text: "Perhaps we should think about next steps eventually.", correct: false, explanation: "Zu zögerlich" }
    ]
  },
  {
    q: "I disagree.",
    a: "Ich stimme nicht zu.",
    options: [
      { text: "I see your point, though from my perspective, I'd approach this differently.", correct: true, explanation: "Anerkennung + eigene Perspektive" },
      { text: "That's simply wrong.", correct: false, explanation: "Zu konfrontativ" },
      { text: "Maybe there's a different angle we could explore.", correct: false, explanation: "Zu schwach, kein klarer Standpunkt" }
    ]
  }
];

// Woche 4 Konzepte (Self-Explanation + Elaborative Interrogation)
CARD_DECKS.w4_concepts = [
  { term: "scalable", de: "skalierbar", why: "Weil das System mehr Nutzer verarbeiten kann, ohne langsamer zu werden.", example: "Our platform is scalable – we went from 100 to 10,000 users without downtime.", impact: "Für Investoren: Wachstum ohne proportionale Kostenerhöhung.", why_not: "Why scalable and not just 'big'? Because scalable implies architecture, not just size." },
  { term: "leverage", de: "nutzen / hebeln", why: "Weil es nicht nur Ressourcen nutzt, sondern deren Wirkung multipliziert.", example: "We leverage our existing network to accelerate market entry.", impact: "Zeigt strategisches Denken, nicht nur operatives Handeln.", why_not: "Why leverage and not 'use'? Because leverage implies amplification – you get more out than you put in." },
  { term: "trade-off", de: "Abwägung / Kompromiss", why: "Weil zwei Faktoren in Konflikt stehen und man bewusst priorisiert.", example: "There's a trade-off between speed and quality here.", impact: "Zeigt analytisches Denken und Entscheidungskompetenz.", why_not: "Why trade-off and not 'problem'? Because it implies a deliberate choice, not a failure." }
];

// Log beim Laden
console.log('✅ flashcards.js geladen - LEGACY_DECKS verfügbar:', Object.keys(CARD_DECKS));
console.log('📝 Core-Decks (w1-w4) werden on-demand aus CSVs geladen');
