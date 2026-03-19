// ================================================================
// SRS – Spaced Repetition System (SM-2 Algorithmus)
// grade: 0=Nochmal, 1=Schwer, 2=Gut, 3=Einfach
// ================================================================

function sm2(review, grade) {
  let { ease_factor = 2.5, interval_days = 1, repetitions = 0 } = review;

  if (grade < 2) {
    repetitions  = 0;
    interval_days = 1;
  } else {
    if (repetitions === 0)      interval_days = 1;
    else if (repetitions === 1) interval_days = 3;
    else                        interval_days = Math.round(interval_days * ease_factor);
    repetitions++;
  }

  // Ease factor anpassen (min 1.3)
  ease_factor = Math.max(1.3, ease_factor + 0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02));

  const next = new Date();
  next.setDate(next.getDate() + interval_days);
  const next_review = next.toISOString().split("T")[0];

  return { ease_factor, interval_days, repetitions, next_review };
}

// ── Record a card review ───────────────────────────────────────
async function recordCardReview(cardId, deck, grade) {
  const existing = _srsCache[cardId] || {
    card_id: cardId, deck,
    ease_factor: 2.5, interval_days: 1, repetitions: 0,
    correct_count: 0, wrong_count: 0, again_count: 0
  };

  const updated   = sm2(existing, grade);
  const isCorrect = grade >= 2;

  const newRecord = {
    ...existing,
    ...updated,
    last_reviewed: new Date().toISOString(),
    correct_count: (existing.correct_count || 0) + (isCorrect ? 1 : 0),
    wrong_count:   (existing.wrong_count   || 0) + (grade === 1 ? 1 : 0),
    again_count:   (existing.again_count   || 0) + (grade === 0 ? 1 : 0),
  };

  _srsCache[cardId] = newRecord;
  _userData.total_reviews = (_userData.total_reviews || 0) + 1;
  if (isCorrect) _userData.total_correct = (_userData.total_correct || 0) + 1;

  updateStreakForToday();
  updateSRSBadge();
  scheduleSave();

  if (supabaseReady()) {
    try {
      await _supabase.from("card_reviews").upsert({
        user_code:     _userCode,
        card_id:       cardId,
        deck,
        ease_factor:   newRecord.ease_factor,
        interval_days: newRecord.interval_days,
        repetitions:   newRecord.repetitions,
        next_review:   newRecord.next_review,
        last_reviewed: newRecord.last_reviewed,
        correct_count: newRecord.correct_count,
        wrong_count:   newRecord.wrong_count,
        again_count:   newRecord.again_count
      }, { onConflict: "user_code,card_id" });
    } catch (e) {}
  }
}

// ── Due Cards & Weak Cards ─────────────────────────────────────
function getDueCards() {
  const today    = new Date().toISOString().split("T")[0];
  const allCards = Object.values(CARD_DECKS).flat();
  const due = [];
  allCards.forEach(card => {
    const cardId = card.q.substring(0, 40);
    const review = _srsCache[cardId];
    if (!review || review.next_review <= today) {
      due.push({ ...card, _cardId: cardId, _review: review });
    }
  });
  return due;
}

function updateSRSBadge() {
  const due   = getDueCards();
  const badge = document.getElementById("srsBadge");
  if (!badge) return;
  if (due.length > 0) {
    badge.textContent  = due.length;
    badge.style.display = "inline-flex";
  } else {
    badge.style.display = "none";
  }
}

function getWeakCards(limit = 10) {
  return Object.values(_srsCache)
    .filter(r => (r.wrong_count || 0) + (r.again_count || 0) > 0)
    .sort((a, b) => {
      const scoreA = (a.again_count || 0) * 2 + (a.wrong_count || 0);
      const scoreB = (b.again_count || 0) * 2 + (b.wrong_count || 0);
      return scoreB - scoreA;
    })
    .slice(0, limit)
    .map(r => {
      const allCards = Object.values(CARD_DECKS).flat();
      return allCards.find(c => c.q.substring(0, 40) === r.card_id);
    })
    .filter(Boolean);
}
