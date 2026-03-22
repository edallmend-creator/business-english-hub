// ================================================================
// SYNC – Supabase Config & User Code System
// Anonymer Code pro Nutzer – kein Login, keine E-Mail
// Format: adjective-number, z.B. "swift-4821"
// ================================================================
const SUPABASE_URL     = "https://fivbdhzndmitngwpaece.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_T95Gc4E2S9snGOwYzhzLzg_gHO8J8Ka";

const CODE_WORDS = [
  "swift","bold","calm","bright","clear","sharp","smart","keen",
  "warm","cool","quick","wise","fair","safe","free","firm","pure",
  "true","able","neat"
];
const STORAGE_KEY_CODE = "be4w_user_code";

let _supabase   = null;
let _userCode   = null;
let _syncTimer  = null;

// Lokaler Cache – wird beim Start geladen, nach Änderungen gesynct
let _userData = {
  completed_exercises: {},
  dual_coding: {},
  settings: {},
  flashcard_positions: {}
};

// In-Memory SRS Cache
let _srsCache = {}; // card_id → review object

// ── Supabase Init ──────────────────────────────────────────────
function supabaseReady() {
  if (_supabase) return true;
  if (SUPABASE_URL.includes("DEINE-URL")) return false;
  try {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  } catch (e) { return false; }
}

// ── Code Generierung ───────────────────────────────────────────
function generateCode() {
  const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${num}`;
}

async function initUserCode() {
  _userCode = localStorage.getItem(STORAGE_KEY_CODE);
  if (!_userCode) {
    _userCode = generateCode();
    localStorage.setItem(STORAGE_KEY_CODE, _userCode);
  }
  updateCodeDisplay();
  const wEl = document.getElementById("welcomeCodeDisplay");
  if (wEl) wEl.textContent = _userCode;
  await loadFromSupabase();
}

// ── Load ───────────────────────────────────────────────────────
async function loadFromSupabase() {
  if (!supabaseReady() || !_userCode) return;
  try {
    const { data: profile } = await _supabase
      .from("user_progress").select("*").eq("user_code", _userCode).single();
    if (profile) {
      _userData.completed_exercises = profile.completed_exercises || {};
      _userData.dual_coding         = profile.dual_coding         || {};
      _userData.settings            = profile.settings            || {};
      _userData.flashcard_positions = profile.flashcard_positions || {};
      _userData.streak_current      = profile.streak_current      || 0;
      _userData.streak_best         = profile.streak_best         || 0;
      _userData.streak_last_date    = profile.streak_last_date    || null;
      _userData.total_reviews       = profile.total_reviews       || 0;
      _userData.total_correct       = profile.total_correct       || 0;
      localStorage.setItem("be4w_dual_coding_v1", JSON.stringify(_userData.dual_coding));
    }
    const { data: reviews } = await _supabase
      .from("card_reviews").select("*").eq("user_code", _userCode);
    if (reviews) {
      _srsCache = {};
      reviews.forEach(r => { _srsCache[r.card_id] = r; });
    }
    updateProgressUI();
    updateStreakUI();
    updateSRSBadge();
    showSyncStatus("✓ Geladen");
  } catch (e) { /* offline – kein Problem */ }
}

// ── Save Profile ───────────────────────────────────────────────
async function saveToSupabase() {
  if (!supabaseReady() || !_userCode) return;
  try {
    _userData.dual_coding = JSON.parse(localStorage.getItem("be4w_dual_coding_v1") || "{}");
  } catch {}
  try {
    await _supabase.from("user_progress").upsert({
      user_code:            _userCode,
      completed_exercises:  _userData.completed_exercises,
      dual_coding:          _userData.dual_coding,
      settings:             _userData.settings,
      flashcard_positions:  _userData.flashcard_positions,
      streak_current:       _userData.streak_current  || 0,
      streak_best:          _userData.streak_best     || 0,
      streak_last_date:     _userData.streak_last_date || null,
      total_reviews:        _userData.total_reviews   || 0,
      total_correct:        _userData.total_correct   || 0
    }, { onConflict: "user_code" });
    showSyncStatus("✓ Gespeichert");
  } catch (e) { showSyncStatus("⚠ Offline"); }
}

function scheduleSave() {
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(saveToSupabase, 2000);
}

// ── Log Session ────────────────────────────────────────────────
async function logSession(exerciseType, deck, cardsReviewed, cardsCorrect, durationSec) {
  _userData.total_sessions = (_userData.total_sessions || 0) + 1;
  scheduleSave();
  if (!supabaseReady()) return;
  try {
    await _supabase.from("session_log").insert({
      user_code:      _userCode,
      exercise_type:  exerciseType,
      deck:           deck || null,
      cards_reviewed: cardsReviewed,
      cards_correct:  cardsCorrect,
      duration_sec:   durationSec
    });
  } catch (e) {}
}

// ── Code-Wechsel ───────────────────────────────────────────────
async function switchUserCode(newCode) {
  if (!newCode || newCode.length < 4) return;
  _userCode = newCode.trim().toLowerCase();
  localStorage.setItem(STORAGE_KEY_CODE, _userCode);
  _srsCache = {};
  updateCodeDisplay();
  await loadFromSupabase();
  closeCodeModal();
}

// ── UI Helpers ─────────────────────────────────────────────────
function updateCodeDisplay() {
  const el = document.getElementById("userCodeDisplay");
  if (el) el.textContent = _userCode || "–";
  const dot = document.getElementById("syncDot");
  if (dot) dot.style.background = supabaseReady() ? "#4ade80" : "#fbbf24";
}

function showSyncStatus(msg) {
  const el = document.getElementById("syncStatus");
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = "1";
  setTimeout(() => { el.style.opacity = "0"; }, 2500);
}

function openCodeModal() {
  document.getElementById("codeModal").style.display = "flex";
  document.getElementById("codeInput").value = "";
  document.getElementById("codeModalDisplay").textContent = _userCode || "–";
  const due  = getDueCards();
  const weak = getWeakCards();
  document.getElementById("supabaseStatus").textContent = supabaseReady()
    ? "🟢 Supabase verbunden – geräteübergreifend gespeichert."
    : "🟡 Kein Supabase – nur lokale Speicherung.";
  document.getElementById("syncStatusModal").innerHTML =
    `📊 ${Object.keys(_srsCache).length} Karten bewertet · ` +
    `${due.length} heute fällig · ` +
    `🔥 Streak: ${_userData.streak_current || 0} Tag(e) · ` +
    `✓ ${_userData.total_correct || 0}/${_userData.total_reviews || 0} korrekt`;
  document.getElementById("codeInput").focus();
}

function closeCodeModal() {
  document.getElementById("codeModal").style.display = "none";
}

// ── Progress Tracking ──────────────────────────────────────────
function markExerciseDone(exerciseKey) {
  if (!_userData.completed_exercises[exerciseKey]) {
    _userData.completed_exercises[exerciseKey] = new Date().toISOString();
    updateProgressUI();
    updateStreakForToday();
    scheduleSave();
  }
}

function saveFlashcardPosition(deck, idx) {
  _userData.flashcard_positions[deck] = idx;
  scheduleSave();
}

function saveSetting(key, value) {
  _userData.settings[key] = value;
  scheduleSave();
}

function getSetting(key, fallback) {
  return _userData.settings[key] !== undefined ? _userData.settings[key] : fallback;
}

function updateProgressUI() {
  const done = _userData.completed_exercises;
  document.querySelectorAll("[data-exercise-key]").forEach(btn => {
    const key = btn.dataset.exerciseKey;
    if (done[key] && !btn.querySelector(".done-badge")) {
      btn.style.position = "relative";
      const badge = document.createElement("span");
      badge.className = "done-badge";
      badge.textContent = "✓";
      badge.style.cssText = "position:absolute;top:-6px;right:-6px;background:#4ade80;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:700;";
      btn.appendChild(badge);
    }
  });
}
