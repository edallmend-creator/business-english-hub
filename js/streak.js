// ================================================================
// STREAK – Tägliches Lernstreak-Tracking
// ================================================================

function updateStreakForToday() {
  const today = new Date().toISOString().split("T")[0];
  const last  = _userData.streak_last_date;
  if (last === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  if (last === yStr) {
    _userData.streak_current = (_userData.streak_current || 0) + 1;
  } else {
    _userData.streak_current = 1; // reset
  }
  _userData.streak_best      = Math.max(_userData.streak_best || 0, _userData.streak_current);
  _userData.streak_last_date = today;
  updateStreakUI();
}

function updateStreakUI() {
  const el = document.getElementById("streakDisplay");
  if (!el) return;
  const s = _userData.streak_current || 0;
  el.textContent = s > 0 ? `🔥 ${s}` : "";
  el.title = `Streak: ${s} Tag${s !== 1 ? "e" : ""} in Folge`;
}
