// ================================================================
// MULTIPLE CHOICE – Situationen & semantische Cluster
// Neue Situation: MC_SITUATIONS-Eintrag + ggf. MC_CLUSTERS ergänzen.
// ================================================================

const MC_SITUATIONS = {
  "Before we move on, one quick point.": "Sie sind mitten im Meeting. Jemand will zum nächsten Punkt – aber Sie haben noch etwas Wichtiges zu sagen.",
  "Could you clarify what you mean by …?": "Ein Kollege hat etwas erklärt, aber Sie sind unsicher was er mit einem bestimmten Begriff meint.",
  "From my side, the next step is …": "Das Meeting endet. Alle schauen Sie an: Was tun Sie als nächstes?",
  "Are we good to proceed?": "Sie haben einen Vorschlag gemacht. Bevor Sie weitermachen, wollen Sie sicherstellen dass alle einverstanden sind.",
  "Just to make sure we're aligned …": "Vor einer wichtigen Entscheidung wollen Sie sichergehen dass alle dasselbe Verständnis haben.",
  "Let me quickly summarize.": "Das Meeting läuft lang. Sie wollen die Kernpunkte kurz bündeln bevor alle gehen.",
  "I'll share a quick summary after the call.": "Das Meeting endet. Ein Kollege hatte Verbindungsprobleme und hat Teile verpasst.",
  "Could we take a closer look at …?": "Eine Zahl in der Präsentation erscheint Ihnen merkwürdig. Sie wollen mehr Details.",
  "Are we on the same page?": "Nach langer Diskussion sind Sie nicht sicher ob alle zum selben Schluss gekommen sind.",
  "Let's move on to the next topic.": "Der aktuelle Punkt ist abgehakt. Die Agenda hat noch vier weitere Themen.",
  "Thanks for the update.": "Ihr Kollege hat gerade den aktuellen Projektstatus erklärt.",
  "So to recap …": "Am Ende eines langen Calls wollen Sie die vereinbarten Punkte nochmal zusammenfassen.",
  "From my perspective …": "Sie haben eine andere Meinung als das Team und wollen Ihren Standpunkt einbringen.",
  "That works for me.": "Jemand schlägt einen neuen Termin vor. Sie sind einverstanden.",
  "Does that sound good to you?": "Sie haben einen Plan vorgestellt und wollen wissen ob Ihr Gegenüber damit einverstanden ist.",
  "Let's align on this later today.": "Ein Thema ist zu komplex für jetzt, muss aber noch heute geklärt werden.",
  "I'll follow up tomorrow.": "Sie können eine Frage gerade nicht beantworten und brauchen Zeit zur Recherche.",
  "Could you send me the latest version?": "Sie haben ein Dokument erhalten, aber es scheint veraltet zu sein.",
  "Let's set up a quick call.": "Per E-Mail ist das Thema zu komplex. Ein kurzes Gespräch wäre effizienter.",
  "Just to double-check …": "Sie sind sich bei einem Detail nicht 100% sicher und wollen es kurz bestätigen.",
  "Any objections if we continue?": "Sie wollen zum nächsten Punkt, prüfen aber erst ob noch jemand etwas hat.",
  "We're slightly behind schedule.": "Das Projekt läuft, aber langsamer als geplant. Sie müssen das Team informieren.",
  "We're on track for Friday.": "Ihr Manager fragt im Weekly ob der Abgabetermin noch realistisch ist.",
  "Let's keep it short and clear.": "Nur noch 10 Minuten. Sie wollen effizient bleiben.",
  "That's a good point.": "Ein Kollege sagt etwas, das Sie nicht bedacht hatten.",
  "Let me add something to that.": "Ihr Kollege macht einen Punkt – und Sie haben eine wichtige Ergänzung.",
  "I totally agree.": "Jemand schlägt eine Lösung vor, die genau Ihrer Meinung entspricht.",
  "I see what you mean.": "Nach einer langen Erklärung haben Sie endlich verstanden was Ihr Kollege meinte.",
  "Could you give a quick example?": "Das Konzept klingt abstrakt. Ein konkretes Beispiel würde helfen.",
  "Let's focus on the key points.": "Die Diskussion schweift ab. Sie wollen zurück zum Wesentlichen.",
  "That's an interesting idea.": "Jemand schlägt eine unerwartete, kreative Lösung vor.",
  "Let's schedule the next meeting.": "Das Meeting ist vorbei. Niemand hat einen Folgetermin fixiert.",
  "We'll finalize the deck by Friday.": "Jemand fragt wann die Präsentation fertig ist.",
  "Please share your screen.": "Sie wollen dass Ihr Kollege Ihnen etwas direkt am Bildschirm zeigt.",
  "Can everyone hear me?": "Sie starten den Call. Bevor Sie beginnen, wollen Sie sichergehen dass alle hören.",
  "Sorry, you're on mute.": "Jemand redet – aber niemand hört etwas.",
  "Let's start with a quick update.": "Das Meeting beginnt. Sie wollen zunächst hören was sich seit letzter Woche getan hat.",
  "Who wants to start?": "Sie leiten das Meeting. Es ist Zeit die Runde zu eröffnen.",
  "Let's go around the table.": "Sie wollen dass jede Person reihum kurz ihren Status teilt.",
  "That's clear from my side.": "Jemand hat etwas erklärt und fragt ob Sie es verstanden haben.",
  "Any other comments?": "Sie sind fast fertig. Bevor Sie abschließen, fragen Sie ob noch jemand etwas hat.",
  "Let's wrap up here.": "Es ist 5 Minuten nach der geplanten Zeit. Das Meeting sollte enden.",
  "The next step is …": "Alle warten auf Klarheit: Was passiert jetzt als nächstes?",
  "Thanks everyone, good session.": "Das Meeting war produktiv. Sie schließen es ab.",
  "Looking forward to the next one.": "Das Meeting endet. Sie verabschieden sich freundlich.",
};

const MC_CLUSTERS = [
  ["Let me quickly summarize.", "So to recap …", "I'll share a quick summary after the call.", "Let's wrap up here.", "That's clear from my side."],
  ["Let's move on to the next topic.", "Before we move on, one quick point.", "Are we good to proceed?", "Any objections if we continue?", "Let's keep it short and clear."],
  ["Are we on the same page?", "Just to make sure we're aligned …", "That works for me.", "Does that sound good to you?", "I totally agree."],
  ["From my side, the next step is …", "The next step is …", "I'll follow up tomorrow.", "Let's align on this later today.", "Let's set up a quick call."],
  ["Could you clarify what you mean by …?", "I see what you mean.", "Could you give a quick example?", "Could we take a closer look at …?", "Just to double-check …"],
  ["That's a good point.", "That's an interesting idea.", "Let me add something to that.", "From my perspective …", "I totally agree."],
  ["We're slightly behind schedule.", "We're on track for Friday.", "We'll finalize the deck by Friday.", "Let's align on this later today.", "I'll follow up tomorrow."],
  ["Let's start with a quick update.", "Who wants to start?", "Let's go around the table.", "Let's schedule the next meeting.", "Looking forward to the next one."],
  ["Please share your screen.", "Can everyone hear me?", "Sorry, you're on mute.", "Let's set up a quick call.", "Could you send me the latest version?"],
  ["Any other comments?", "Let's wrap up here.", "Thanks everyone, good session.", "Looking forward to the next one.", "That's clear from my side."],
  ["Thanks for the update.", "From my perspective …", "So to recap …", "I'll share a quick summary after the call.", "Any other comments?"],
  ["Just to double-check …", "Just to make sure we're aligned …", "Before we move on, one quick point.", "Could you clarify what you mean by …?", "Are we on the same page?"],
];


const RIVC_EXAMPLES = {
  "I'd like to suggest a small change to the proposal.": {
    "📞": "Quick thought – small change to the proposal?",
    "📧": "I wanted to flag a small change to the proposal. Would you have a moment to review?",
    "🖥️": "I'd like to suggest / a small change / to the proposal."
  },
  "Could you clarify what you mean by the scope?": {
    "📞": "Quick clarification – what do you mean by the scope?",
    "📧": "Could you clarify what you mean by the scope in section two? That would help us align.",
    "🖥️": "Could you clarify / what you mean / by the scope?"
  },
  "From my side, the next step would be to clarify responsibilities.": {
    "📞": "From my side – clarify responsibilities next.",
    "📧": "From my side, the next step would be to clarify responsibilities. I'll send a draft by Friday.",
    "🖥️": "From my side / the next step / would be to clarify responsibilities."
  },
  "Let's lock Friday, 10 am.": {
    "📞": "Let's lock Friday, 10 am – works for you?",
    "📧": "Could we lock Friday, 10 am for the next call? Please confirm if that works.",
    "🖥️": "Let's lock / Friday / 10 am."
  },
  "Two quick things upfront.": {
    "📞": "Two quick things before we start.",
    "📧": "Just two quick points upfront before diving in:",
    "🖥️": "Two quick things / upfront / before we begin."
  },
  "If it's not too much trouble, could we align for next week?": {
    "📞": "Could we align next week – any slot work for you?",
    "📧": "If it's not too much trouble, could we align for next week? Even a short call would help.",
    "🖥️": "If it's not too much trouble / could we align / for next week?"
  },
  "We'll send a concise pre-read by six.": {
    "📞": "Pre-read goes out by six – we'll send it over.",
    "📧": "We'll send a concise pre-read by six this evening. Please review the key points before tomorrow.",
    "🖥️": "We'll send / a concise pre-read / by six."
  },
  "I'd like to add something to that point.": {
    "📞": "Quick add to that point, if I may.",
    "📧": "I'd like to add one thought to the point you raised – please see below.",
    "🖥️": "I'd like to add / something / to that point."
  },
  "That's a fair point – from my perspective, I'd see it slightly differently.": {
    "📞": "Fair point – I'd see it slightly differently, though.",
    "📧": "That's a fair point. From my perspective, however, I'd see it slightly differently – here's why:",
    "🖥️": "That's a fair point / from my perspective / I'd see it slightly differently."
  },
  "Let's keep moving – we're slightly behind schedule.": {
    "📞": "Let's keep moving – slightly behind here.",
    "📧": "Just a heads-up: we're slightly behind schedule. Let's keep moving to stay on track.",
    "🖥️": "Let's keep moving / we're slightly / behind schedule."
  },
  "Could we possibly look at a few challenges with this approach?": {
    "📞": "Could we look at a couple of challenges quickly?",
    "📧": "Could we possibly look at a few challenges with this approach before we finalise?",
    "🖥️": "Could we possibly look / at a few challenges / with this approach?"
  },
  "Before we close, let me flag one open point.": {
    "📞": "Before we close – one open point.",
    "📧": "Before we close this thread, I'd like to flag one open point that needs a decision.",
    "🖥️": "Before we close / let me flag / one open point."
  }
};
