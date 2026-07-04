// ================================================================
// MODAL HELPERS
// ================================================================
const overlay = document.getElementById("modalOverlay");
let _modalKeyHandler = null;

function setModalKeys(fn) {
  if (_modalKeyHandler) document.removeEventListener("keydown", _modalKeyHandler);
  _modalKeyHandler = fn;
  document.addEventListener("keydown", fn);
}

function closeModal() {
  overlay.classList.remove("open");
  if (_modalKeyHandler) {
    document.removeEventListener("keydown", _modalKeyHandler);
    _modalKeyHandler = null;
  }
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalOverlay").addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});

function openModal() { overlay.classList.add("open"); }

// ================================================================
// EXERCISE DISPATCHER
// Wird von den HTML-Buttons aufgerufen: onclick="openExercise('type','deck')"
// ================================================================
async function openExercise(type, deck) {
  overlay.classList.add("open");
  
  // Mapping: deck-Name → CSV-Datei
  const csvMap = {
    'w1_phrases': 'week1-core',
    'w2_phrases': 'week2-core',
    'w3_phrases': 'week3-core',
    'w4_phrases': 'week4-core',
    'false_friends': 'false-friends',
    'softener_cards': 'softener-cards',
    'all_phrases': ['week1-core', 'week2-core', 'week3-core', 'week4-core'] // Kombiniere alle
  };
  
  let cards = [];
  
  // Wenn es ein CSV-Deck ist, lade es
  if (csvMap[deck]) {
    try {
      if (Array.isArray(csvMap[deck])) {
        // Kombiniere mehrere CSVs (für 'all_phrases')
        for (const csv of csvMap[deck]) {
          const csvCards = await loadCardsFromCSV(csv);
          cards = cards.concat(csvCards);
        }
      } else {
        cards = await loadCardsFromCSV(csvMap[deck]);
      }
      console.log(`✅ ${cards.length} Phrasen geladen aus CSV`);
    } catch (err) {
      console.error('❌ CSV Fehler:', err);
      showError('Fehler beim Laden', `Die Übung "${deck}" konnte nicht geladen werden.`);
      return;
    }
  } else {
    // Legacy-Deck (tone_cards, w4_concepts, etc.)
    cards = CARD_DECKS[deck] || [];
  }
  
  if (cards.length === 0) {
    console.warn('⚠️ Keine Karten gefunden für:', deck);
    showError('Keine Phrasen', `Das Deck "${deck}" ist leer.`);
    return;
  }
  
  // Dispatch zu verschiedenen Übungstypen
  switch (type) {
    case "flashcard":     renderFlashcards(cards, _userData.flashcard_positions[deck] || 0, deck); break;
    case "retrieval":     renderRetrieval(cards); break;
    case "mc":
    case "gapfill":       renderGapFill(cards); break;
    case "coach":         await openCoach(deck); break;
    case "roulette":      renderRoulette(); break;
    case "dualcoding":    renderDualCoding(); break;
    case "rivc":          renderRIVC(cards); break;
    case "shadowing":     renderShadowing(); break;
    case "tone":          renderToneExercise(cards); break;
    case "false_friends": renderFalseFriends(cards); break;
    case "softener":      renderSoftenerTrainer(cards); break;
    case "self_explain":  renderSelfExplain(); break;
    case "why_cards":     renderWhyCards(); break;
    case "framing":       renderFraming(); break;
    case "pitch":          renderNYCPitch(); break;
    default: console.warn("Unknown exercise type:", type);
  }
  if (type !== "roulette" && type !== "dualcoding" && deck) {
    markExerciseDone(type + "_" + deck);
  }
}

// Hilfsfunktion: Lade Karten aus CSV
async function loadCardsFromCSV(csvName) {
  const response = await fetch(`data/phrases/${csvName}.csv`);
  if (!response.ok) throw new Error(`CSV nicht gefunden: ${csvName}`);
  
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });
  
  return parsed.data.map(row => ({
    q: row.englisch || row.english || row.roh || '',
    a: row.deutsch || row.german || '',
    example: row.beispiel || row.example || '',
    notes: row.notizen || row.notes || '',
    wrong: row.wrong || '',
    // Softener-spezifisch
    roh: row.roh || '',
    dank: row.dank || '',
    bitte: row.bitte || '',
    frage: row.frage || '',
    perspektive: row.perspektive || '',
    kontext: row.kontext || ''
  })).filter(card => card.q || card.roh);
}

// Error-Modal anzeigen
function showError(title, message) {
  document.getElementById("modalContent").innerHTML = `
    <div style="text-align:center;padding:40px 20px;">
      <div style="font-size:52px;margin-bottom:12px;">❌</div>
      <div style="font-family:var(--font-display);font-size:24px;font-weight:900;text-transform:uppercase;color:var(--red);margin-bottom:8px;">${title}</div>
      <div style="font-size:15px;color:var(--muted);margin-bottom:20px;">${message}</div>
      <button class="btn-primary" onclick="closeModal()">Zurück</button>
    </div>`;
}

async function openCoach(deck) {
  // Mapping: deck-Name → CSV-Datei
  const csvMap = {
    'w1_phrases': 'week1-core',
    'w2_phrases': 'week2-core',
    'w3_phrases': 'week3-core',
    'w4_phrases': 'week4-core',
    'all_phrases': ['week1-core', 'week2-core', 'week3-core', 'week4-core']
  };
  
  let cards = [];
  
  // Wenn es ein CSV-Deck ist, lade es
  if (csvMap[deck]) {
    try {
      if (Array.isArray(csvMap[deck])) {
        for (const csv of csvMap[deck]) {
          const csvCards = await loadCardsFromCSV(csv);
          cards = cards.concat(csvCards);
        }
      } else {
        cards = await loadCardsFromCSV(csvMap[deck]);
      }
    } catch (err) {
      console.error('❌ Coach CSV Fehler:', err);
      showError('Fehler beim Laden', 'Coach-Phrasen konnten nicht geladen werden.');
      return;
    }
  } else {
    // Legacy-Deck
    cards = CARD_DECKS[deck] || [];
  }
  
  const settings = {
    timer: getSetting("coach_timer", false),
    srs:   getSetting("coach_srs",   true)
  };
  renderCoach(cards, deck, settings, 0, Date.now());
}

// ================================================================
// NISCHEN-DECKS (dynamisch aus CSV laden - DIREKT via fetch)
// ================================================================
async function openNiche(nicheName) {
  console.log('🔍 openNiche aufgerufen mit:', nicheName);
  overlay.classList.add("open");
  
  // Zeige Loading-Indicator
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">Lade Nischen-Phrasen...</div>
    <div style="text-align:center;padding:60px 0;">
      <div style="font-size:48px;margin-bottom:16px;">⏳</div>
      <div style="color:var(--muted);">Einen Moment bitte...</div>
    </div>
  `;
  
  try {
    // Direktes Fetch der CSV
    const csvPath = `data/phrases/niche-${nicheName}.csv`;
    console.log('📄 Lade CSV:', csvPath);
    
    const response = await fetch(csvPath);
    console.log('📡 Response Status:', response.status, response.ok);
    
    if (!response.ok) {
      throw new Error(`CSV nicht gefunden: ${csvPath} (Status: ${response.status})`);
    }
    
    const csvText = await response.text();
    console.log('📝 CSV Text geladen:', csvText.substring(0, 100) + '...');
    
    // Papa Parse zum Parsen
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });
    
    console.log('✅ Papa Parse Result:', parsed);
    
    if (parsed.errors.length > 0) {
      console.warn('⚠️ CSV Parse Warnings:', parsed.errors);
    }
    
    // Konvertiere zu Karten-Format
    const cards = parsed.data.map(row => ({
      q: row.englisch || row.english || '',
      a: row.deutsch || row.german || '',
      example: row.beispiel || row.example || '',
      notes: row.notizen || row.notes || ''
    })).filter(card => card.q && card.a);
    
    console.log(`✅ ${cards.length} Phrasen konvertiert`);
    
    if (cards.length === 0) {
      throw new Error('Keine Phrasen gefunden in CSV');
    }
    
    console.log('🚀 Starte Flashcards mit', cards.length, 'Karten');
    
    // Starte Flashcards
    renderFlashcards(cards, 0, `niche-${nicheName}`);
    
  } catch (error) {
    console.error('Fehler beim Laden der Nische:', error);
    document.getElementById("modalContent").innerHTML = `
      <div class="modal-title">❌ Fehler</div>
      <div style="text-align:center;padding:40px 0;">
        <p style="color:var(--muted);margin-bottom:20px;">
          Die Nischen-Phrasen konnten nicht geladen werden.
        </p>
        <button class="btn-primary" onclick="closeModal()">Zurück</button>
      </div>
    `;
  }
}

// ================================================================
// DUAL CODING
// ================================================================
const DC_STORAGE_KEY = "be4w_dual_coding_v1";
const DC_EMOJIS = ["😀","😎","🤝","💡","🎯","🚀","⚡","🔥","💪","🧠","✅","📌","🗓️","📊","💼","🎤","🌍","⏱️","🏆","🎲","🦆","☕","✈️","🖥️","📞","🤔","💬","🙌","👀","🎉","🌱","🔑","🎸","🧩","🌊","🎪","🏋️","🎭","🌟","💎"];
const DC_MAX = 3;

function getDCData() {
  try { return JSON.parse(localStorage.getItem(DC_STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveDCData(data) { localStorage.setItem(DC_STORAGE_KEY, JSON.stringify(data)); scheduleSave(); }

function getDCEmojis(phrase) {
  const d   = getDCData();
  const val = d[phrase];
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return [val]; // legacy single emoji
}

function renderDualCoding() {
  const cards  = getAllCards();
  let   dc_idx = 0;

  function draw() {
    const c        = cards[dc_idx];
    const saved    = getDCData();
    const curEmojis = getDCEmojis(c.q);
    const total    = Object.keys(saved).length;

    const anchorHtml = curEmojis.length > 0
      ? `<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          ${curEmojis.map((e, i) => `
            <span style="font-size:36px;position:relative;cursor:pointer;" title="Anker entfernen" onclick="window._dcRemove('${c.q.replace(/'/g,"\\'")}',${i})">
              ${e}<span style="position:absolute;top:-4px;right:-6px;background:var(--red);color:#fff;border-radius:50%;width:16px;height:16px;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700;">×</span>
            </span>`).join("")}
          <span style="font-size:13px;color:var(--gold);vertical-align:middle;">${curEmojis.length}/${DC_MAX} Anker</span>
        </div>` : "";

    document.getElementById("modalContent").innerHTML = `
      <div class="modal-title">Dual Coding</div>
      <div class="modal-subtitle">Setzen Sie bis zu 3 Bild-Anker pro Phrase</div>
      <div class="tip-box">
        <strong>🧠 Warum das hilft:</strong> Selbst gewählte Bilder sind persönlicher als vorgegebene. Ihr Gehirn verknüpft die Phrase mit eigenen mentalen Bildern – mehrere Anker = mehr Abrufpfade. Je absurder, desto besser.
      </div>
      <div class="fc-card" style="gap:10px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">Phrase</div>
        <div style="font-size:21px;font-weight:700;color:var(--navy);line-height:1.3;">${c.q}</div>
        <div style="font-size:15px;color:var(--muted);">${c.a}</div>
        <div style="font-size:13px;color:var(--muted);font-style:italic;border-left:3px solid var(--gold);padding-left:10px;margin-top:4px;">${c.example || ""}</div>
        ${anchorHtml}
      </div>
      ${curEmojis.length < DC_MAX ? `
        <div style="margin:14px 0 8px;font-size:13px;font-weight:600;color:var(--navy);">
          Emoji hinzufügen ${curEmojis.length > 0 ? `<span style="font-weight:400;color:var(--muted);">(${DC_MAX - curEmojis.length} weitere möglich)</span>` : ""}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px;" id="dcEmojiGrid">
          ${DC_EMOJIS.map(e => `<button
            style="font-size:20px;padding:7px 9px;border-radius:9px;border:2px solid ${curEmojis.includes(e) ? "var(--gold)" : "var(--border)"};background:${curEmojis.includes(e) ? "var(--gold-light)" : "var(--surface)"};cursor:pointer;transition:all 0.12s;"
            onclick="window._dcAdd('${c.q.replace(/'/g,"\\'")}','${e}')">${e}</button>`).join("")}
        </div>` : `<div style="margin:14px 0 16px;font-size:13px;color:var(--muted);">Maximum von ${DC_MAX} Ankern erreicht.</div>`}
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <button class="btn-secondary" id="dcPrev" ${dc_idx === 0 ? "disabled" : ""}>← Zurück</button>
        <span class="fc-pill">${dc_idx + 1}/${cards.length} · ${total} Phrasen mit Anker</span>
        <button class="btn-primary" id="dcNext">${dc_idx < cards.length - 1 ? "Weiter →" : "Fertig ✓"}</button>
      </div>`;

    document.getElementById("dcPrev").onclick = () => { if (dc_idx > 0) { dc_idx--; draw(); } };
    document.getElementById("dcNext").onclick = () => {
      if (dc_idx < cards.length - 1) { dc_idx++; draw(); }
      else { markExerciseDone("dualcoding_all"); closeModal(); }
    };
    setModalKeys((e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); document.getElementById("dcNext").click(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); if (dc_idx > 0) { dc_idx--; draw(); } }
      else if (e.key === "Escape") closeModal();
    });
  }

  window._dcAdd = (phrase, emoji) => {
    const d   = getDCData();
    const cur = getDCEmojis(phrase);
    if (cur.includes(emoji) || cur.length >= DC_MAX) return;
    d[phrase] = [...cur, emoji];
    saveDCData(d);
    draw();
  };
  window._dcRemove = (phrase, idx) => {
    const d   = getDCData();
    const cur = getDCEmojis(phrase);
    cur.splice(idx, 1);
    if (cur.length === 0) delete d[phrase];
    else d[phrase] = cur;
    saveDCData(d);
    draw();
  };
  draw();
}

// ================================================================
// CLASSIC FLASHCARD ENGINE
// ================================================================
let fc_cards = [], fc_idx = 0, fc_started = false, fc_deToEn = true, fc_deck = "";

function renderFlashcards(cards, startIdx, deck) {
  fc_cards = cards.slice(); fc_idx = startIdx || 0; fc_started = true; fc_deToEn = true; fc_deck = deck || "";
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">Lernmodus</div>
    <div class="modal-subtitle">Antwort zeigen · bewerten · Spaced Repetition</div>
    <div id="fcMain">
      <div class="fc-card">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:4px;" id="fcDir"></div>
        <div class="fc-q" id="fcQ"></div>
        <div class="fc-label" id="fcExL">Beispiel</div>
        <div class="fc-example" id="fcEx"></div>
        <div class="fc-label" id="fcAL">Lösung</div>
        <div class="fc-a" id="fcA"></div>
        <div id="fcSRS" style="display:none;margin-top:16px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:8px;">Wie leicht war das?</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button onclick="fcRate(0)" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:2px solid #ef4444;background:#fef2f2;color:#dc2626;font-weight:700;cursor:pointer;font-size:13px;">🔁 Nochmal</button>
            <button onclick="fcRate(1)" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:2px solid #f97316;background:#fff7ed;color:#ea580c;font-weight:700;cursor:pointer;font-size:13px;">😬 Schwer</button>
            <button onclick="fcRate(2)" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-weight:700;cursor:pointer;font-size:13px;">👍 Gut</button>
            <button onclick="fcRate(3)" style="flex:1;min-width:70px;padding:9px 6px;border-radius:10px;border:2px solid #3b82f6;background:#eff6ff;color:#2563eb;font-weight:700;cursor:pointer;font-size:13px;">⚡ Leicht</button>
          </div>
          <div id="fcNextInfo" style="font-size:11px;color:var(--muted);margin-top:8px;text-align:center;min-height:16px;"></div>
        </div>
      </div>
      <div class="fc-controls">
        <div class="fc-controls-left">
          <button class="btn-secondary" id="fcPrev">← Zurück</button>
          <button class="btn-primary" id="fcShow">Antwort zeigen</button>
          <button class="btn-primary" id="fcNext">Weiter →</button>
        </div>
        <div class="fc-controls-right">
          <span class="fc-pill" id="fcPill">1/${fc_cards.length}</span>
          <button class="btn-secondary" id="fcFlip" title="Übungsrichtung umkehren">🔄 Richtung</button>
          <button class="btn-secondary" id="fcReset">Neu starten</button>
        </div>
      </div>
      <div class="fc-hint">Tastatur: ← → navigieren · A = Antwort · 1-4 = bewerten · F = flip</div>
    </div>`;
  document.getElementById("fcPrev").onclick  = fcPrev;
  document.getElementById("fcNext").onclick  = fcNext;
  document.getElementById("fcShow").onclick  = () => fcRender(false);
  document.getElementById("fcFlip").onclick  = () => { fc_deToEn = !fc_deToEn; fcRender(true); };
  document.getElementById("fcReset").onclick = () => { fc_idx = 0; fc_deToEn = true; fcRender(true); };
  setModalKeys(fcKeys);
  fcRender(true);
}

window.fcRate = function (grade) {
  const c      = fc_cards[fc_idx] || {};
  const cardId = c.q ? c.q.substring(0, 40) : null;
  if (!cardId) return;
  recordCardReview(cardId, fc_deck, grade);
  saveFlashcardPosition(fc_deck, fc_idx);
  const review = _srsCache[cardId];
  if (review) {
    const days   = review.interval_days;
    const labels = ["heute nochmal", "morgen", "in " + days + " Tagen", "in " + days + " Tagen"];
    const el     = document.getElementById("fcNextInfo");
    if (el) el.textContent = `Nächste Wiederholung: ${labels[grade] || "bald"}`;
  }
  setTimeout(() => fcNext(), 900);
};

function fcRender(hide) {
  const c   = fc_cards[fc_idx] || {};
  const q   = fc_deToEn ? (c.a || "") : (c.q || "");
  const a   = fc_deToEn ? (c.q || "") : (c.a || "");
  document.getElementById("fcDir").textContent = fc_deToEn ? "🇩🇪 Deutsch → Englisch sprechen" : "🇬🇧 Englisch → Deutsch sprechen";
  document.getElementById("fcQ").textContent   = q;
  const ex     = (c.example || "").trim();
  const showEx = !hide && ex && !fc_deToEn;
  document.getElementById("fcExL").style.display = showEx ? "block" : "none";
  document.getElementById("fcEx").style.display  = showEx ? "block" : "none";
  document.getElementById("fcEx").textContent    = ex;
  document.getElementById("fcAL").style.display  = (!hide && a) ? "block" : "none";
  document.getElementById("fcA").style.display   = (!hide && a) ? "block" : "none";
  document.getElementById("fcA").textContent     = a;
  document.getElementById("fcPill").textContent  = `${fc_idx + 1}/${fc_cards.length}`;
  document.getElementById("fcPrev").disabled     = fc_idx === 0;
  document.getElementById("fcNext").disabled     = fc_idx === fc_cards.length - 1;
  const srsEl = document.getElementById("fcSRS");
  if (srsEl) { srsEl.style.display = (!hide && a) ? "block" : "none"; }
  if (srsEl && !hide) document.getElementById("fcNextInfo").textContent = "";
  fcInjectDCEmoji();
}

function fcInjectDCEmoji() {
  const c      = fc_cards[fc_idx] || {};
  const emojis = getDCEmojis(c.q);
  const qEl    = document.getElementById("fcQ");
  if (!qEl || !emojis.length) return;
  if (!qEl.querySelector(".dc-badge")) {
    const badge = document.createElement("span");
    badge.className   = "dc-badge";
    badge.title       = "Ihre Dual Coding Anker";
    badge.style.cssText = "font-size:22px;margin-left:8px;vertical-align:middle;opacity:0.9;cursor:help;";
    badge.textContent = emojis.join(" ");
    qEl.appendChild(badge);
  }
}

function fcNext() { if (fc_idx < fc_cards.length - 1) { fc_idx++; fcRender(true); saveFlashcardPosition(fc_deck, fc_idx); } }
function fcPrev() { if (fc_idx > 0) { fc_idx--; fcRender(true); } }
function fcKeys(e) {
  if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); fcNext(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); fcPrev(); }
  else if (e.key.toLowerCase() === "a") { e.preventDefault(); fcRender(false); }
  else if (e.key.toLowerCase() === "f") { e.preventDefault(); fc_deToEn = !fc_deToEn; fcRender(true); }
  else if (e.key === "1") { e.preventDefault(); window.fcRate(0); }
  else if (e.key === "2") { e.preventDefault(); window.fcRate(1); }
  else if (e.key === "3") { e.preventDefault(); window.fcRate(2); }
  else if (e.key === "4") { e.preventDefault(); window.fcRate(3); }
}

// ================================================================
// RETRIEVAL PRACTICE ENGINE (mit Timer)
// ================================================================
let rt_cards = [], rt_idx = 0, rt_started = false, rt_deToEn = true;
let rt_unlocked = false, rt_paused = false;
let rt_timerId = null, rt_startTs = 0, rt_accMs = 0;
let rt_seconds = 5, rt_timerOn = true, rt_autoNext = false;

function stopTimer() { if (rt_timerId) clearInterval(rt_timerId); rt_timerId = null; }

function renderRetrieval(cards) {
  rt_cards = cards.slice(); rt_idx = 0; rt_started = false; stopTimer();
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">Retrieval Practice</div>
    <div class="modal-subtitle">Laut sprechen · "Weiter" erst nach Timer</div>
    <div id="rtStart">
      <div class="tip-box">
        <strong>🧠 Wie funktioniert der Timer?</strong><br>
        Sie sehen eine Phrase und sprechen die Übersetzung <strong>laut</strong> aus. Der Timer zählt hoch und sperrt "Weiter" – das verhindert Durchklicken ohne echten Abruf. Empfehlung: <strong>5–8 Sek.</strong> für bekannte Phrasen, <strong>10–15 Sek.</strong> für neue.
      </div>
      <div class="rt-settings">
        <div class="rt-field"><div class="rt-label">Sekunden bis Weiter</div><input class="rt-input" id="rtSec" type="number" min="1" max="30" step="0.5" value="5"></div>
        <div class="rt-toggle-row"><label class="rt-switch"><input type="checkbox" id="rtTimerOn" checked><span class="rt-slider"></span></label>Timer aktiv</div>
        <div class="rt-toggle-row"><label class="rt-switch"><input type="checkbox" id="rtAutoNext"><span class="rt-slider"></span></label>Auto Weiter</div>
      </div>
      <div style="margin-top:14px;">
        <button class="btn-primary" id="rtBtnStart" style="width:100%;justify-content:center;">🇩🇪 → 🇬🇧 &nbsp;Starten</button>
      </div>
    </div>
    <div id="rtMain" style="display:none">
      <div class="fc-card">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:4px;" id="rtDir"></div>
        <div class="fc-q" id="rtQ"></div>
        <div class="fc-label" id="rtExL">Beispiel</div>
        <div class="fc-example" id="rtEx"></div>
        <div class="fc-label" id="rtAL">Notfall-Lösung</div>
        <div class="fc-a" id="rtA"></div>
      </div>
      <div class="fc-controls">
        <div class="fc-controls-left">
          <button class="btn-secondary" id="rtPrev">← Zurück</button>
          <button class="btn-primary" id="rtNext" disabled>Weiter →</button>
          <button class="btn-secondary" id="rtPause">Pause</button>
          <button class="btn-secondary" id="rtHelp">Notfall-Lösung</button>
        </div>
        <div class="fc-controls-right">
          <span class="fc-pill" id="rtPill">1/${rt_cards.length}</span>
          <span class="rt-time-pill" id="rtTime">0.0s</span>
          <button class="btn-secondary" id="rtFlip" title="Richtung umkehren">🔄</button>
          <button class="btn-secondary" id="rtReset">Neu starten</button>
        </div>
      </div>
      <div class="fc-hint">H = Notfall-Lösung · P = Pause · F = Richtung flip · Enter/→ = Weiter (wenn frei)</div>
    </div>`;
  document.getElementById("rtBtnStart").onclick = () => rtBegin(true);
  document.getElementById("rtNext").onclick      = rtNext;
  document.getElementById("rtPrev").onclick      = rtPrev;
  document.getElementById("rtPause").onclick     = rtTogglePause;
  document.getElementById("rtHelp").onclick      = () => rtRender(false);
  document.getElementById("rtFlip").onclick      = () => { rt_deToEn = !rt_deToEn; rtRender(true); };
  document.getElementById("rtReset").onclick     = () => { stopTimer(); rt_started = false; rt_deToEn = true; document.getElementById("rtStart").style.display = "block"; document.getElementById("rtMain").style.display = "none"; };
  setModalKeys(rtKeys);
}

function rtBegin(deToEn) {
  rt_deToEn   = deToEn;
  rt_seconds  = Math.min(30, Math.max(1, parseFloat(document.getElementById("rtSec").value) || 5));
  rt_timerOn  = document.getElementById("rtTimerOn").checked;
  rt_autoNext = document.getElementById("rtAutoNext").checked && rt_timerOn;
  rt_started  = true;
  document.getElementById("rtStart").style.display = "none";
  document.getElementById("rtMain").style.display  = "block";
  rt_idx = 0; rtRender(true);
}

function rtRender(hide) {
  const c      = rt_cards[rt_idx] || {};
  const q      = rt_deToEn ? (c.a || "") : (c.q || "");
  const a      = rt_deToEn ? (c.q || "") : (c.a || "");
  document.getElementById("rtDir").textContent = rt_deToEn ? "🇩🇪 Deutsch → Englisch sprechen" : "🇬🇧 Englisch → Deutsch sprechen";
  document.getElementById("rtQ").textContent   = q;
  const ex     = (c.example || "").trim();
  const showEx = !hide && ex && !rt_deToEn;
  document.getElementById("rtExL").style.display = showEx ? "block" : "none";
  document.getElementById("rtEx").style.display  = showEx ? "block" : "none";
  document.getElementById("rtEx").textContent    = ex;
  document.getElementById("rtAL").style.display  = (!hide && a) ? "block" : "none";
  document.getElementById("rtA").style.display   = (!hide && a) ? "block" : "none";
  document.getElementById("rtA").textContent     = a;
  document.getElementById("rtPill").textContent  = `${rt_idx + 1}/${rt_cards.length}`;
  document.getElementById("rtPrev").disabled     = rt_idx === 0;
  rt_paused = false; document.getElementById("rtPause").textContent = "Pause";
  if (!rt_timerOn) { stopTimer(); rt_unlocked = true; document.getElementById("rtNext").disabled = false; document.getElementById("rtTime").textContent = "off"; return; }
  rt_unlocked = false; document.getElementById("rtNext").disabled = true;
  rt_accMs = 0; rt_startTs = performance.now(); document.getElementById("rtTime").textContent = "0.0s";
  stopTimer();
  rt_timerId = setInterval(() => {
    const el = (rt_accMs + (rt_paused ? 0 : performance.now() - rt_startTs)) / 1000;
    document.getElementById("rtTime").textContent = el.toFixed(1) + "s";
    if (!rt_unlocked && el >= rt_seconds) {
      rt_unlocked = true;
      document.getElementById("rtNext").disabled = false;
      if (rt_autoNext) setTimeout(() => { if (rt_unlocked && !rt_paused) rtNext(); }, 150);
    }
  }, 50);
}

function rtTogglePause() {
  if (!rt_timerOn) return;
  if (rt_paused) { rt_startTs = performance.now(); rt_paused = false; document.getElementById("rtPause").textContent = "Pause"; }
  else { rt_accMs += performance.now() - rt_startTs; rt_paused = true; document.getElementById("rtPause").textContent = "Weiter"; }
}

function rtNext() { if (rt_timerOn && (!rt_unlocked || rt_paused)) return; if (rt_idx < rt_cards.length - 1) { rt_idx++; rtRender(true); } }
function rtPrev() { if (rt_idx > 0) { rt_idx--; rtRender(true); } }
function rtKeys(e) {
  if (!rt_started) return;
  if (e.key === "ArrowLeft") { e.preventDefault(); rtPrev(); }
  else if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); rtNext(); }
  else if (e.key.toLowerCase() === "h") { e.preventDefault(); rtRender(false); }
  else if (e.key.toLowerCase() === "p") { e.preventDefault(); rtTogglePause(); }
  else if (e.key.toLowerCase() === "f") { e.preventDefault(); rt_deToEn = !rt_deToEn; rtRender(true); }
}

// ================================================================
// ALLE KARTEN (flach)
// ================================================================
function getAllCards() { return Object.values(CARD_DECKS).flat(); }

// ================================================================
// KONTEXT-ROULETTE
// ================================================================
const ROULETTE_SITUATIONS = [
  { emoji: "🛗", text: "Sie sind im Aufzug mit dem CEO. Sie haben 20 Sekunden." },
  { emoji: "📞", text: "Ihr Telefon klingelt. Wichtiger Kunde. Sie sind unvorbereitet." },
  { emoji: "☕", text: "Beim Kaffee vor dem Meeting – jemand fragt direkt nach Ihrem Status." },
  { emoji: "🖥️", text: "Ihr Bildschirm teilt sich. 12 Personen schauen. Der erste Satz gehört Ihnen." },
  { emoji: "⏱️", text: "5 Minuten Überziehung. Sie müssen das Meeting höflich beenden." },
  { emoji: "🌍", text: "Ein unbekannter Kollege aus London tippt Sie an: 'Quick question…'" },
  { emoji: "😬", text: "Stille im Call. Alle schauen Sie an. Was sagen Sie jetzt?" },
  { emoji: "✈️", text: "Sie sitzen neben Ihrem größten Kunden im Flieger. Fangen Sie an." },
  { emoji: "📊", text: "Mitten in der Präsentation fragt jemand etwas. Sie brauchen Zeit zum Denken." },
  { emoji: "🤝", text: "Erstes Meeting mit einem neuen internationalen Partner. Sie eröffnen." },
  { emoji: "🔇", text: "Jemand hat vergessen sich zu muten. Ansprechen – freundlich." },
  { emoji: "🏃", text: "Sie kommen 3 Minuten zu spät. Das Meeting hat begonnen. Was sagen Sie?" },
  { emoji: "💡", text: "Eine Idee schießt Ihnen in den Kopf. Alle warten. Jetzt oder nie." },
  { emoji: "🗓️", text: "Spontane Frage: 'Are you free Thursday?' – Sie sind es nicht." },
  { emoji: "🦆", text: "Ihr innerer Business Duck flüstert Ihnen zu: Sag's auf Englisch." },
];

let roulette_card = null, roulette_situation = null;

function renderRoulette() {
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">Kontext-Roulette</div>
    <div class="modal-subtitle">Zufällige Phrase · zufällige Situation · kein Netz</div>
    <div class="tip-box">
      <strong>🧠 Desirable Difficulty:</strong> Eine Phrase ohne Vorbereitung in einer unbekannten Situation abrufen trainiert genau das, was im echten Gespräch zählt. Unangenehm? Gut. Das ist der Lerneffekt.
    </div>
    <div id="rouletteSituation" style="font-size:42px;text-align:center;padding:16px 0 6px;"></div>
    <div id="rouletteSituationText" style="font-size:17px;font-weight:600;text-align:center;color:var(--navy);margin-bottom:20px;min-height:48px;padding:0 8px;"></div>
    <div class="fc-card" style="text-align:center;gap:10px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">Sagen Sie das auf Englisch:</div>
      <div id="rouletteQ" style="font-size:24px;font-weight:700;color:var(--navy);line-height:1.3;"></div>
      <div id="rouletteReveal" style="display:none;padding-top:14px;border-top:1px solid var(--border);">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:6px;">Englisch:</div>
        <div id="rouletteA" style="font-size:18px;color:var(--muted);font-style:italic;"></div>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      <button class="btn-primary" id="rouletteNew" style="flex:1;">🎲 Neu würfeln</button>
      <button class="btn-secondary" id="rouletteShow">Lösung zeigen</button>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-top:10px;">Tastatur: Space = neu würfeln · A = Lösung anzeigen</div>`;
  document.getElementById("rouletteNew").onclick  = rouletteSpin;
  document.getElementById("rouletteShow").onclick = () => {
    if (!roulette_card) return;
    document.getElementById("rouletteReveal").style.display = "block";
    document.getElementById("rouletteA").textContent = roulette_card.q;
  };
  setModalKeys((e) => {
    if (e.key === " ") { e.preventDefault(); rouletteSpin(); }
    else if (e.key.toLowerCase() === "a") { document.getElementById("rouletteShow").click(); }
    else if (e.key === "Escape") closeModal();
  });
  rouletteSpin();
}

function rouletteSpin() {
  const cards     = getAllCards();
  roulette_card   = cards[Math.floor(Math.random() * cards.length)];
  roulette_situation = ROULETTE_SITUATIONS[Math.floor(Math.random() * ROULETTE_SITUATIONS.length)];
  document.getElementById("rouletteSituation").textContent    = roulette_situation.emoji;
  document.getElementById("rouletteSituationText").textContent = roulette_situation.text;
  document.getElementById("rouletteQ").textContent            = roulette_card.a;
  document.getElementById("rouletteReveal").style.display     = "none";
  const card = document.querySelector("#rouletteQ");
  if (card) { card.style.opacity = "0"; setTimeout(() => card.style.opacity = "1", 50); }
}

// ================================================================
// TON & GRAMMATIK ENGINE – Hedging & Signposting
// ================================================================
const TONE_CONCEPT_LABELS = {
  hedging:    "🛡️ Hedging",
  signposting: "🗺️ Signposting",
  both:       "🛡️🗺️ Hedging + Signposting"
};

function renderToneExercise(cards) {
  let t_idx = 0, t_score = 0;
  const shuffled = cards.slice().sort(() => Math.random() - 0.5);

  function draw() {
    const c       = shuffled[t_idx];
    const options = [
      { text: c.correct, correct: true },
      { text: c.wrong1,  correct: false },
      { text: c.wrong2,  correct: false }
    ].sort(() => Math.random() - 0.5);

    document.getElementById("modalContent").innerHTML = `
      <div class="modal-title">Ton & Grammatik</div>
      <div class="modal-subtitle">Welche Formulierung klingt professionell und höflich?</div>
      <div class="tip-box">
        <strong>🧠 Hedging & Signposting:</strong> Englische Höflichkeit entsteht nicht durch Weichheit, sondern durch Struktur. Softener wie <em>could, might, possibly</em> nehmen Druck raus. Signposting wie <em>two quick points</em> bereitet Zuhörer vor.
      </div>
      ${(c.concept === "hedging" || c.concept === "both") ? `<div class="tip-box" style="background:#eef4ff;border-left-color:#3b6fd4;">
        <strong>🇬🇧 Sprachhinweis:</strong> Hedging ist besonders typisch für britisches Englisch – dort ist es Standard um Reibung zu vermeiden.
      </div>` : ""}
      <div class="fc-card" style="gap:10px;margin-bottom:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">
          ${TONE_CONCEPT_LABELS[c.concept] || "Ton"} · Karte ${t_idx + 1}/${shuffled.length}
        </div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:4px;">Direkte Variante – so würden viele Deutsche es sagen:</div>
        <div style="font-size:18px;font-weight:700;color:var(--navy);font-style:italic;border-left:3px solid var(--red);padding-left:12px;">"${c.raw}"</div>
        <div style="font-size:13px;color:var(--muted);margin-top:8px;">Welche Version klingt professionell auf Englisch?</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;" id="toneOptions">
        ${options.map((opt, i) => `
          <button class="mc-option" data-correct="${opt.correct}" onclick="toneSelect(this)"
            style="text-align:left;background:var(--surface);border:2px solid var(--border);border-radius:12px;padding:14px 18px;font-size:14px;font-family:var(--font-body);color:var(--navy);cursor:pointer;transition:all 0.15s;line-height:1.5;">
            <span style="font-weight:700;color:var(--muted);margin-right:10px;">${["A","B","C"][i]}</span>${opt.text}
          </button>`).join("")}
      </div>
      <div id="toneFeedback" style="min-height:20px;margin-top:14px;"></div>
      <div id="toneTip" style="display:none;font-size:13px;background:var(--gold-light);border-left:3px solid var(--gold);padding:10px 14px;border-radius:8px;margin-top:8px;color:var(--navy);"></div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
        <span class="fc-pill">${t_idx + 1}/${shuffled.length} · ${t_score} ✓</span>
        <button class="btn-primary" id="toneNext" style="display:none;">Weiter →</button>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-top:8px;">Tastatur: A B C · Enter = Weiter</div>`;

    window.toneSelect = function (btn) {
      if (document.getElementById("toneNext").style.display !== "none") return;
      const isCorrect = btn.dataset.correct === "true";
      if (isCorrect) t_score++;
      document.querySelectorAll(".mc-option").forEach(b => {
        b.style.pointerEvents = "none";
        if (b.dataset.correct === "true") { b.style.borderColor = "#2a7a2a"; b.style.background = "#e8f5e9"; b.style.color = "#1a4a1a"; }
        else if (b === btn && !isCorrect) { b.style.borderColor = "var(--red)"; b.style.background = "#fdecea"; b.style.color = "var(--red)"; }
        else { b.style.opacity = "0.4"; }
      });
      document.getElementById("toneFeedback").innerHTML = isCorrect
        ? `<span style="color:#2a7a2a;font-weight:700;">✓ Genau richtig!</span>`
        : `<span style="color:var(--red);font-weight:700;">✗ Nicht ganz.</span> <span style="color:var(--muted);">Die grüne Option ist die höflichere Variante.</span>`;
      const tipEl = document.getElementById("toneTip");
      tipEl.style.display = "block";
      tipEl.innerHTML = `<strong>💡 Warum?</strong> ${c.tip}`;
      document.getElementById("toneNext").style.display = "inline-flex";
    };

    document.getElementById("toneNext").onclick = () => {
      if (t_idx < shuffled.length - 1) { t_idx++; draw(); }
      else {
        const pct = Math.round((t_score / shuffled.length) * 100);
        document.getElementById("modalContent").innerHTML = `
          <div class="modal-title">Ton & Grammatik</div>
          <div style="text-align:center;padding:32px 0;">
            <div style="font-size:52px;margin-bottom:12px;">${pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
            <div style="font-family:var(--font-display);font-size:36px;font-weight:900;text-transform:uppercase;color:var(--navy);margin-bottom:8px;">${t_score} / ${shuffled.length}</div>
            <div style="font-size:15px;color:var(--muted);margin-bottom:8px;">${pct}% richtig</div>
            <div style="font-size:14px;color:var(--muted);margin-bottom:28px;">${pct >= 80 ? "Sehr gut – jetzt auf echte Calls übertragen." : pct >= 50 ? "Gute Basis – Hedging und Signposting nochmal durch." : "Nochmal durch – der Tonunterschied sitzt bald automatisch."}</div>
            <button class="btn-primary" onclick="openExercise('tone','tone_cards')">🔄 Nochmal</button>
          </div>`;
      }
    };

    setModalKeys((e) => {
      const answered = document.getElementById("toneNext")?.style.display !== "none";
      if (answered && (e.key === "Enter" || e.key === "ArrowRight")) { e.preventDefault(); document.getElementById("toneNext").click(); return; }
      if (!answered) {
        const i = { a: 0, b: 1, c: 2 }[e.key.toLowerCase()];
        if (i !== undefined) { const btns = document.querySelectorAll(".mc-option"); if (btns[i]) btns[i].click(); }
      }
      if (e.key === "Escape") closeModal();
    });
  }
  draw();
}

// ================================================================
// FALSE FRIENDS ENGINE
// ================================================================
function renderFalseFriends(cards) {
  let ff_idx = 0, ff_score = 0;
  const shuffled = cards.slice().sort(() => Math.random() - 0.5);

  function draw() {
    const c = shuffled[ff_idx];
    document.getElementById("modalContent").innerHTML = `
      <div class="modal-title">False Friends</div>
      <div class="modal-subtitle">Falsche Freunde · Karte ${ff_idx + 1}/${shuffled.length}</div>
      <div class="fc-card" style="gap:10px;margin-bottom:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">Englisches Wort</div>
        <div style="font-size:32px;font-weight:900;color:var(--navy);font-family:var(--font-display);text-transform:uppercase;">${c.q}</div>
      </div>
      <div id="ffReveal" style="display:none;">
        <div style="background:var(--surface2);border-radius:10px;padding:14px 16px;margin-bottom:12px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">Bedeutet tatsächlich</div>
          <div style="font-size:18px;font-weight:700;color:var(--navy);margin-bottom:6px;">✓ ${c.a}</div>
          <div style="font-size:14px;color:var(--red);margin-bottom:6px;">✗ NICHT: ${c.wrong}</div>
          ${c.example ? `<div style="font-size:13px;color:var(--muted);font-style:italic;border-left:3px solid var(--gold);padding-left:10px;margin-top:8px;">${c.example}</div>` : ""}
          ${c.note ? `<div style="font-size:13px;color:var(--muted);margin-top:8px;background:var(--bg);border-radius:8px;padding:8px 12px;">💡 ${c.note}</div>` : ""}
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <button class="btn-secondary" onclick="renderFalseFriends(CARD_DECKS.false_friends)">↩ Neu mischen</button>
          <button class="btn-primary" id="ffNext">${ff_idx < shuffled.length - 1 ? "Weiter →" : "🔄 Nochmal"}</button>
          <span class="fc-pill">${ff_idx + 1}/${shuffled.length}</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:8px;">Enter = Weiter</div>
      </div>
      <div id="ffRevealWrap">
        <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('ffReveal').style.display='block';document.getElementById('ffRevealWrap').style.display='none';">
          Bedeutung aufdecken (A)
        </button>
      </div>`;

    document.getElementById("ffNext") && (document.getElementById("ffNext").onclick = () => {
      if (ff_idx < shuffled.length - 1) { ff_idx++; draw(); }
      else renderFalseFriends(cards);
    });

    setModalKeys(e => {
      if ((e.key === "a" || e.key === "A") && document.getElementById("ffRevealWrap").style.display !== "none") {
        document.getElementById("ffReveal").style.display = "block";
        document.getElementById("ffRevealWrap").style.display = "none";
      }
      if (e.key === "Enter") { const b = document.getElementById("ffNext"); if (b) b.click(); }
      if (e.key === "Escape") closeModal();
    });
  }
  draw();
}

// ================================================================
// BUSINESS ENGLISH COACH (Woche 1: SRS + Dual Coding + Optional Typing)
// ================================================================
function renderCoach(queue, deck, settings, idx, sessionStart) {
  // Session Stats
  if (!window._coachStats) {
    window._coachStats = {
      correct: 0,
      wrong: 0,
      streak: 0,
      maxStreak: 0,
      answered: []
    };
  }
  
  // Session Ende
  if (idx >= queue.length) {
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    const stats = window._coachStats;
    const total = stats.correct + stats.wrong;
    const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    
    logSession("coach", deck, queue.length, 0, duration);
    markExerciseDone("coach_" + deck);
    
    document.getElementById("modalContent").innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:52px;margin-bottom:12px;">🎉</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:900;text-transform:uppercase;color:var(--primary);margin-bottom:8px;">Session abgeschlossen!</div>
        <div style="font-size:15px;color:var(--muted);margin-bottom:24px;">${queue.length} Phrasen · ${Math.round(duration / 60)} Min.</div>
        
        <div style="background:var(--surface);border:2px solid var(--border);border-radius:12px;padding:20px;max-width:400px;margin:0 auto 24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:900;color:var(--primary);">${stats.correct}</div>
              <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Richtig</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:32px;font-weight:900;color:var(--red);">${stats.wrong}</div>
              <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Wiederholen</div>
            </div>
          </div>
          <div style="background:var(--border);border-radius:99px;height:8px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;background:var(--primary);width:${accuracy}%;transition:width 0.5s;border-radius:99px;"></div>
          </div>
          <div style="font-size:18px;font-weight:700;color:var(--text);text-align:center;">${accuracy}% Genauigkeit</div>
          ${stats.maxStreak > 1 ? `<div style="font-size:13px;color:var(--gold);text-align:center;margin-top:8px;">🔥 Längste Streak: ${stats.maxStreak}</div>` : ''}
        </div>
        
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button class="btn-primary" onclick="window._coachStats=null;openCoach('${deck}')">🔄 Nochmal</button>
          ${stats.wrong > 0 ? `<button class="btn-secondary" onclick="coachReviewWrong()">📚 Schwache üben (${stats.wrong})</button>` : ''}
        </div>
      </div>`;
    updateSRSBadge();
    
    window.coachReviewWrong = function() {
      const wrongCards = queue.filter((c, i) => window._coachStats.answered[i] === false);
      window._coachStats = null;
      renderCoach(wrongCards, deck + '_review', settings, 0, Date.now());
    };
    return;
  }

  const card = queue[idx];
  const cardId = card.q ? card.q.substring(0, 40) : null;
  const review = cardId ? _srsCache[cardId] : null;
  const showSRS = settings.srs !== false;
  let typingEnabled = getSetting("coach_typing", true);
  let showTimer = getSetting("coach_timer", false);
  let showEmoji = getSetting("coach_emoji", true);
  const pct = Math.round((idx / queue.length) * 100);
  const stats = window._coachStats;

  let answerShown = false;
  let userAnswer = "";

  const emojis = cardId ? getDCEmojis(card.a) : [];  // Emojis für Deutsche Phrase!
  // const emojiBar wird jetzt in buildCard() berechnet!
  const srsInfo = review ? `<span class="fc-pill" style="font-size:11px;">×${review.correct_count || 0}✓ ×${(review.wrong_count || 0) + (review.again_count || 0)}✗</span>` : `<span class="fc-pill" style="font-size:11px;color:var(--gold);">Neu</span>`;

  function buildCard(revealed) {
    // Berechne emojiBar NEU bei jedem Render!
    const emojis = cardId ? getDCEmojis(card.a) : [];
    const emojiBar = emojis.length ? `<div style="font-size:28px;margin-top:4px;">${emojis.join(" ")}</div>` : "";
    
    document.getElementById("modalContent").innerHTML = `
      <button class="modal-close" onclick="closeModal()" style="position:absolute;top:16px;right:16px;background:#fff;border:2px solid #e0e0e0;color:#666;width:36px;height:36px;border-radius:50%;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.08);z-index:1000;">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <!-- Settings Bar -->
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:13px;font-weight:600;color:var(--navy);">⚙️ Einstellungen</div>
          <button onclick="toggleSettingsHelp()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:0;line-height:1;">💡</button>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;">
            <input type="checkbox" id="toggleTyping" ${typingEnabled ? 'checked' : ''} 
              onchange="saveSetting('coach_typing',this.checked);coachRefresh();"
              style="width:16px;height:16px;cursor:pointer;">
            <span>✍️ Tippen</span>
          </label>
          ${deck !== 'w1_phrases' && deck !== 'w1_phrases_review' ? `
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;">
            <input type="checkbox" id="toggleTimer" ${showTimer ? 'checked' : ''} 
              onchange="saveSetting('coach_timer',this.checked);coachRefresh();"
              style="width:16px;height:16px;cursor:pointer;">
            <span>⏱️ Timer</span>
          </label>
          ` : ''}
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px;">
            <input type="checkbox" id="toggleEmoji" ${showEmoji ? 'checked' : ''} 
              onchange="saveSetting('coach_emoji',this.checked);coachRefresh();"
              style="width:16px;height:16px;cursor:pointer;">
            <span>🖼️ Emojis</span>
          </label>
        </div>
        <div id="settingsHelp" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--muted);line-height:1.5;">
          <div style="margin-bottom:6px;"><strong style="color:var(--navy);">✍️ Tippen:</strong> Verstärkt aktiven Recall – du musst dich committen!</div>
          ${deck !== 'w1_phrases' && deck !== 'w1_phrases_review' ? `<div style="margin-bottom:6px;"><strong style="color:var(--navy);">⏱️ Timer:</strong> 5 Sek zum Nachdenken – erzwingt schnellen Abruf.</div>` : ''}
          <div><strong style="color:var(--navy);">🖼️ Emojis:</strong> Dual Coding – visuelle Anker für besseres Erinnern.</div>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <div class="modal-title" style="margin:0;font-size:20px;padding-right:60px;">Business English Coach</div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${srsInfo}
            <span class="fc-pill">${idx + 1}/${queue.length}</span>
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div style="background:var(--border);border-radius:99px;height:4px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;background:var(--gold);width:${pct}%;transition:width 0.3s;border-radius:99px;"></div>
        </div>
        
        <!-- Session Stats -->
        <div style="display:flex;gap:12px;align-items:center;font-size:12px;color:var(--muted);">
          <span>✅ ${stats.correct}</span>
          <span>❌ ${stats.wrong}</span>
          ${stats.streak > 0 ? `<span style="color:var(--gold);">🔥 ${stats.streak}</span>` : ''}
        </div>
      </div>
      
      <!-- Phrase Card -->
      <div class="fc-card" style="gap:8px;padding:18px 20px;">
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:var(--gold);font-weight:700;">
          🇩🇪 Deutsch → Englisch ${typingEnabled && !revealed ? 'tippen' : 'sprechen'}
        </div>
        <div style="font-size:${card.a.length > 60 ? "18px" : "22px"};font-weight:700;color:var(--navy);line-height:1.35;" id="coachQ">${card.a}</div>
        ${revealed ? emojiBar : ''}
        
        ${typingEnabled && !revealed ? `
          <div style="margin-top:12px;">
            <input type="text" id="coachInput" placeholder="Tippe deine Übersetzung..." 
              style="width:100%;padding:12px;border:2px solid var(--border);border-radius:8px;font-size:15px;font-family:var(--font-body);transition:border-color 0.2s;"
              onfocus="this.style.borderColor='var(--primary)'" 
              onblur="this.style.borderColor='var(--border)'"
              onkeydown="if(event.key==='Enter' && this.value.trim()) { coachReveal(); }">
            <div style="font-size:11px;color:var(--muted);margin-top:6px;text-align:center;">
              Drücke Enter zum Aufdecken
            </div>
          </div>
        ` : ''}
        
        ${revealed ? `
          ${typingEnabled && userAnswer ? `
            <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:4px;">Deine Antwort</div>
              <div style="font-size:16px;color:var(--text);padding:8px 12px;background:var(--bg);border-radius:6px;font-family:monospace;">${userAnswer}</div>
            </div>
          ` : ''}
          <div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:4px;">Englisch</div>
            <div style="font-size:${card.q.length > 60 ? "17px" : "20px"};font-weight:700;color:var(--primary);line-height:1.35;">${card.q}</div>
            ${card.example ? `<div style="font-size:12px;color:var(--muted);font-style:italic;border-left:3px solid var(--gold);padding-left:10px;margin-top:8px;">${card.example}</div>` : ""}
          </div>
        ` : ''}
        
        ${revealed && showSRS && showEmoji && emojis.length === 0 ? `
          <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:14px;">
            <div style="font-size:12px;font-weight:600;color:var(--navy);margin-bottom:8px;">🖼️ Bild-Anker wählen <span style="font-weight:400;color:var(--muted);">(optional)</span></div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">
              ${DC_EMOJIS.map(e => `<button onclick="coachSetEmoji('${card.a.replace(/'/g, "\'")}','${e}')"
                style="font-size:18px;padding:5px 7px;border-radius:8px;border:1px solid var(--border);background:var(--surface);cursor:pointer;">${e}</button>`).join("")}
            </div>
          </div>
        ` : ''}
      </div>
      
      ${!revealed ? `
        <button class="btn-primary" style="width:100%;justify-content:center;margin-top:14px;" onclick="coachReveal()">
          Antwort zeigen <span style="font-size:11px;opacity:0.6;">(A)</span>
        </button>
      ` : ''}
      
      ${revealed && showSRS ? `
        <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:8px;">Wie leicht war das?</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;" id="coachRateBtns">
            <button onclick="coachRate(0)" style="flex:1;min-width:60px;padding:10px 4px;border-radius:10px;border:2px solid #ef4444;background:#fef2f2;color:#dc2626;font-weight:700;cursor:pointer;font-size:12px;">🔁<br>Nochmal</button>
            <button onclick="coachRate(1)" style="flex:1;min-width:60px;padding:10px 4px;border-radius:10px;border:2px solid #f97316;background:#fff7ed;color:#ea580c;font-weight:700;cursor:pointer;font-size:12px;">😬<br>Schwer</button>
            <button onclick="coachRate(2)" style="flex:1;min-width:60px;padding:10px 4px;border-radius:10px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-weight:700;cursor:pointer;font-size:12px;">👍<br>Gut</button>
            <button onclick="coachRate(3)" style="flex:1;min-width:60px;padding:10px 4px;border-radius:10px;border:2px solid #3b82f6;background:#eff6ff;color:#2563eb;font-weight:700;cursor:pointer;font-size:12px;">⚡<br>Leicht</button>
          </div>
          <div style="font-size:10px;color:var(--muted);text-align:center;margin-top:6px;">Tastatur: 1 · 2 · 3 · 4</div>
        </div>
      ` : ''}
      
      ${revealed && !showSRS ? `
        <button class="btn-primary" style="width:100%;justify-content:center;margin-top:14px;" onclick="coachNext()">
          Weiter → <span style="font-size:11px;opacity:0.6;">(Enter)</span>
        </button>
      ` : ''}
      
      <div style="font-size:11px;color:var(--muted);text-align:center;margin-top:10px;">
        ${!revealed ? 'A = Antwort · Escape = Schließen' : (showSRS ? '1–4 bewerten · Enter = überspringen' : 'Enter = Weiter')}
      </div>`;
  }



  window.coachRefresh = function() {
    // Update globale Settings
    typingEnabled = getSetting("coach_typing", true);
    showTimer = getSetting("coach_timer", false);
    showEmoji = getSetting("coach_emoji", true);
    
    // Neu rendern
    buildCard(answerShown);
    setCoachKeys();  // ← WICHTIG! Event-Handler neu registrieren!
    
    // Auto-Focus auf Input wenn Typing AN ist
    if (typingEnabled && !answerShown) {
      setTimeout(() => {
        const input = document.getElementById('coachInput');
        if (input) input.focus();
      }, 100);
    }
  };

  window.toggleSettingsHelp = function() {
    const help = document.getElementById('settingsHelp');
    if (help) help.style.display = help.style.display === 'none' ? 'block' : 'none';
  };

  window.coachReveal = function () {
    if (typingEnabled) {
      const input = document.getElementById('coachInput');
      if (input) userAnswer = input.value.trim();
    }
    answerShown = true;
    buildCard(true);
    setCoachKeys();
  };

  window.coachSetEmoji = function (phrase, emoji) {
    const d = getDCData();
    const cur = getDCEmojis(phrase);
    if (!cur.includes(emoji) && cur.length < DC_MAX) {
      d[phrase] = [...cur, emoji];
      saveDCData(d);
    }
    buildCard(true);
    setCoachKeys();
  };

  window.coachRate = function (rating) {
    if (!cardId || !answerShown) return;
    srsRecord(cardId, rating);
    
    // Update Stats
    if (rating >= 2) {
      stats.correct++;
      stats.streak++;
      stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
      stats.answered[idx] = true;
    } else {
      stats.wrong++;
      stats.streak = 0;
      stats.answered[idx] = false;
    }
    
    coachNext();
  };

  window.coachNext = function () {
    renderCoach(queue, deck, settings, idx + 1, sessionStart);
  };

  function setCoachKeys() {
    setModalKeys(e => {
      if (e.key === "a" || e.key === "A") {
        if (!answerShown) coachReveal();
      }
      if (e.key >= "1" && e.key <= "4" && answerShown) {
        coachRate(parseInt(e.key) - 1);
      }
      if (e.key === "Enter" && answerShown) {
        if (showSRS) coachRate(2); // Default: "Gut"
        else coachNext();
      }
      if (e.key === "Escape") closeModal();
    });
  }

  buildCard(false);
  setCoachKeys();
  
  // Auto-Focus auf Input-Feld
  if (typingEnabled) {
    setTimeout(() => {
      const input = document.getElementById('coachInput');
      if (input) input.focus();
    }, 100);
  }
}

// ================================================================
// MULTIPLE CHOICE ENGINE
// ================================================================
let mc_cards = [], mc_idx = 0, mc_score = 0, mc_answered = false;

function renderGapFill(cards) {
  mc_cards = cards.slice().sort(() => Math.random() - 0.5);
  mc_idx = 0; mc_score = 0;
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">Multiple Choice</div>
    <div class="modal-subtitle">Deutschen Satz lesen · richtige englische Phrase wählen</div>
    <div class="tip-box">
      <strong>🧠 Warum Multiple Choice?</strong> Falsche Optionen zwingen das Gehirn zur Unterscheidung – das stärkt die genaue Repräsentation der Phrase im Gedächtnis.
    </div>
    <div id="mcMain"></div>`;
  mcDraw();
}

function mcGetDistractors(correct, all, count = 3) {
  const phrase      = correct.q;
  const myCluster   = MC_CLUSTERS.find(cl => cl.includes(phrase)) || [];
  const clusterPool = all.filter(c => c.q !== phrase && myCluster.includes(c.q));
  const fallbackPool = all.filter(c => c.q !== phrase && !myCluster.includes(c.q));
  const shuffleArr  = arr => arr.sort(() => Math.random() - 0.5);
  shuffleArr(clusterPool); shuffleArr(fallbackPool);
  const result = [];
  for (const c of clusterPool) { if (result.length < count) result.push(c); }
  for (const c of fallbackPool) { if (result.length < count) result.push(c); }
  return result.slice(0, count);
}

function mcDraw() {
  const c = mc_cards[mc_idx] || {};
  mc_answered = false;
  const distractors = mcGetDistractors(c, mc_cards);
  const options     = [c, ...distractors].sort(() => Math.random() - 0.5);

  document.getElementById("mcMain").innerHTML = `
    <div class="fc-card" style="gap:10px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">Situation</div>
      <div style="font-size:17px;color:var(--navy);line-height:1.5;font-weight:500;">${MC_SITUATIONS[c.q] || c.a}</div>
      <div style="margin-top:8px;">
        <button onclick="this.nextElementSibling.style.display='block';this.style.display='none';"
          style="background:none;border:1px dashed var(--border);border-radius:8px;padding:5px 12px;font-size:12px;color:var(--muted);cursor:pointer;">
          🇩🇪 Übersetzung anzeigen
        </button>
        <div style="display:none;font-size:13px;color:var(--muted);border-left:3px solid var(--border);padding-left:10px;">🇩🇪 ${c.a}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;" id="mcOptions">
      ${options.map((opt, i) => `
        <button class="mc-option" data-correct="${opt.q === c.q}" onclick="mcSelect(this)"
          style="text-align:left;background:var(--surface);border:2px solid var(--border);border-radius:12px;padding:14px 18px;font-size:15px;font-family:var(--font-body);color:var(--navy);cursor:pointer;transition:all 0.15s;line-height:1.4;">
          <span style="font-weight:700;color:var(--muted);margin-right:10px;">${["A","B","C","D"][i]}</span>${opt.q}
        </button>`).join("")}
    </div>
    <div id="mcFeedback" style="min-height:24px;margin-top:14px;font-size:14px;"></div>
    <div id="mcExample" style="display:none;font-size:13px;color:var(--muted);font-style:italic;border-left:3px solid var(--gold);padding-left:10px;margin-top:8px;"></div>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
      <span class="fc-pill">${mc_idx + 1}/${mc_cards.length} · ${mc_score} ✓</span>
      <button class="btn-primary" id="mcNext" style="display:none;">Weiter →</button>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-top:8px;">Tastatur: A B C D · Enter/→ = Weiter</div>`;

  setModalKeys((e) => {
    if (mc_answered) {
      if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); mcNext(); }
      return;
    }
    const keys = { a: 0, b: 1, c: 2, d: 3 };
    const idx2 = keys[e.key.toLowerCase()];
    if (idx2 !== undefined) { const btns = document.querySelectorAll(".mc-option"); if (btns[idx2]) btns[idx2].click(); }
    if (e.key === "Escape") closeModal();
  });
}

function mcSelect(btn) {
  if (mc_answered) return;
  mc_answered = true;
  const isCorrect = btn.dataset.correct === "true";
  const c = mc_cards[mc_idx];
  if (isCorrect) mc_score++;
  document.querySelectorAll(".mc-option").forEach(b => {
    b.style.cursor = "default"; b.style.pointerEvents = "none";
    if (b.dataset.correct === "true") { b.style.borderColor = "#2a7a2a"; b.style.background = "#e8f5e9"; b.style.color = "#1a4a1a"; }
    else if (b === btn && !isCorrect) { b.style.borderColor = "var(--red)"; b.style.background = "#fdecea"; b.style.color = "var(--red)"; }
    else { b.style.opacity = "0.45"; }
  });
  const fb = document.getElementById("mcFeedback");
  fb.innerHTML = isCorrect
    ? `<span style="color:#2a7a2a;font-weight:700;">✓ Richtig!</span>`
    : `<span style="color:var(--red);font-weight:700;">✗ Nicht ganz.</span> <span style="color:var(--muted);">Die richtige Antwort ist grün markiert.</span>`;
  if (c.example) {
    const exEl = document.getElementById("mcExample");
    exEl.style.display = "block";
    exEl.innerHTML = `Beispiel: <em>${c.example}</em>`;
  }
  const nextBtn = document.getElementById("mcNext");
  if (nextBtn) nextBtn.style.display = "inline-flex";
  nextBtn.onclick = mcNext;
}

function mcNext() {
  if (mc_idx < mc_cards.length - 1) { mc_idx++; mcDraw(); }
  else {
    const pct = Math.round((mc_score / mc_cards.length) * 100);
    document.getElementById("mcMain").innerHTML = `
      <div style="text-align:center;padding:32px 0;">
        <div style="font-size:52px;margin-bottom:12px;">${pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚"}</div>
        <div style="font-family:var(--font-display);font-size:36px;font-weight:900;text-transform:uppercase;color:var(--navy);margin-bottom:8px;">${mc_score} / ${mc_cards.length}</div>
        <div style="font-size:15px;color:var(--muted);margin-bottom:8px;">${pct}% richtig</div>
        <div style="font-size:14px;color:var(--muted);margin-bottom:28px;">${pct >= 80 ? "Sehr gut – jetzt mit Retrieval Practice vertiefen." : pct >= 50 ? "Solide Basis – wiederhole die schwierigen Phrasen." : "Nochmal durch, dann wird's leichter."}</div>
        <button class="btn-primary" onclick="renderGapFill(mc_cards)">🔄 Nochmal (neu gemischt)</button>
      </div>`;
  }
}

// ================================================================
// RIVC ENGINE – Retrieval in Varied Contexts
// ================================================================
const RIVC_CONTEXTS = [
  { icon: "📞", label: "Telefon / Call",     prompt: "Sie sind live im Call. Kurz, direkt, kein Lesen.",           hint: "Im Call kürzen Sie oft – weniger formal, mehr Tempo." },
  { icon: "📧", label: "E-Mail",             prompt: "Sie schreiben eine kurze E-Mail. Etwas formeller, schriftlich.", hint: "In der E-Mail darf ein Nebensatz mehr rein – und ein freundlicher Opener." },
  { icon: "🖥️", label: "Meeting / Präsentation", prompt: "Sie sitzen vor 8 Personen. Klar, strukturiert, Blickkontakt.", hint: "Im Meeting wirkt Thought Chunking – sprechen Sie in Sinneinheiten." }
];

let rivc_cards = [], rivc_idx = 0, rivc_ctx = 0, rivc_revealed = false;

function renderRIVC(cards) {
  rivc_cards = cards.slice().sort(() => Math.random() - 0.5);
  rivc_idx = 0; rivc_ctx = 0;
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">RIVC – Kontext-Switcher</div>
    <div class="modal-subtitle">Dieselbe Phrase · drei Bühnen · ein Gedächtnis</div>
    <div class="tip-box">
      <strong>🧠 Retrieval in Varied Contexts:</strong> Je mehr Kontexte, desto mehr Abrufpfade. Das Gehirn verknüpft die Phrase mit Call, E-Mail <em>und</em> Meeting.
    </div>
    <div id="rivcMain"></div>`;
  rivcDraw();
}

function rivcDraw() {
  rivc_revealed  = false;
  const c        = rivc_cards[rivc_idx] || {};
  const ctx      = RIVC_CONTEXTS[rivc_ctx];
  const examples = RIVC_EXAMPLES[c.q] || {};
  const exText   = examples[ctx.icon] || c.q;
  const pills    = RIVC_CONTEXTS.map((x, i) =>
    `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 13px;border-radius:999px;font-size:13px;font-weight:600;
      background:${i === rivc_ctx ? "var(--navy)" : "var(--surface2)"};
      color:${i === rivc_ctx ? "#fff" : "var(--muted)"};">${x.icon} ${x.label}</span>`
  ).join("");

  document.getElementById("rivcMain").innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">${pills}</div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--muted);margin-bottom:12px;">
      💡 ${ctx.prompt}
    </div>
    <div class="fc-card" style="gap:10px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">Auf Englisch sagen (${ctx.label})</div>
      <div style="font-size:20px;font-weight:700;color:var(--navy);line-height:1.35;">${c.a}</div>
      <div id="rivcRevealArea" style="display:none;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:6px;margin-top:10px;">Muster (${ctx.label})</div>
        <div style="font-size:17px;color:var(--text);font-style:italic;">${exText}</div>
        ${ctx.hint ? `<div style="font-size:12px;color:var(--muted);margin-top:8px;border-left:3px solid var(--gold);padding-left:10px;">${ctx.hint}</div>` : ""}
      </div>
    </div>
    <div id="rivcRevealBtn">
      <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('rivcRevealArea').style.display='block';document.getElementById('rivcRevealBtn').style.display='none';document.getElementById('rivcNextArea').style.display='flex';">
        Muster aufdecken (A)
      </button>
    </div>
    <div id="rivcNextArea" style="display:none;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap;">
      ${rivc_ctx < 2
        ? `<button class="btn-primary" onclick="rivc_ctx++;rivcDraw()">Nächster Kontext: ${RIVC_CONTEXTS[rivc_ctx + 1]?.icon || ""} →</button>`
        : rivc_idx < rivc_cards.length - 1
          ? `<button class="btn-primary" onclick="rivc_idx++;rivc_ctx=0;rivcDraw()">Nächste Phrase →</button>`
          : `<button class="btn-primary" onclick="renderRIVC(rivc_cards)">🔄 Nochmal</button>`}
      <span class="fc-pill">Phrase ${rivc_idx + 1}/${rivc_cards.length} · Kontext ${rivc_ctx + 1}/3</span>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-top:10px;">A = aufdecken · Enter = Weiter · Escape = Schließen</div>`;

  setModalKeys(e => {
    if ((e.key === "a" || e.key === "A") && document.getElementById("rivcRevealBtn").style.display !== "none") {
      document.getElementById("rivcRevealBtn").querySelector("button").click();
    }
    if (e.key === "Enter") {
      const btns = document.getElementById("rivcNextArea");
      if (btns && btns.style.display !== "none") btns.querySelector("button")?.click();
    }
    if (e.key === "Escape") closeModal();
  });
}

// ================================================================
// SHADOWING ENGINE
// ================================================================
const SHADOWING_PHRASES = [];  // wird aus data/week1.js etc. gefüllt – hier Placeholder

let sh_idx = 0;

function renderShadowing() {
  sh_idx = 0;
  const allCards = getAllCards().sort(() => Math.random() - 0.5).slice(0, 20);
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">Shadowing</div>
    <div class="modal-subtitle">Hören, nachsprechen, imitieren</div>
    <div class="tip-box">
      <strong>🧠 Shadowing:</strong> Wiederholen Sie die Phrase laut nach, so schnell wie möglich. Achten Sie auf Rhythmus, Betonung und Klang – nicht nur auf die Wörter.
    </div>
    <div id="shadowMain"></div>`;

  function shDraw() {
    const c = allCards[sh_idx] || {};
    document.getElementById("shadowMain").innerHTML = `
      <div class="fc-card" style="text-align:center;gap:12px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">Nachsprechen</div>
        <div style="font-size:22px;font-weight:700;color:var(--navy);line-height:1.4;">${c.q}</div>
        ${c.a ? `<div style="font-size:15px;color:var(--muted);">🇩🇪 ${c.a}</div>` : ""}
      </div>
      <div style="display:flex;gap:10px;margin-top:16px;align-items:center;flex-wrap:wrap;">
        <button class="btn-secondary" ${sh_idx === 0 ? "disabled" : ""} onclick="sh_idx--;shDraw()">← Zurück</button>
        <span class="fc-pill">${sh_idx + 1}/${allCards.length}</span>
        <button class="btn-primary" onclick="sh_idx < ${allCards.length - 1} ? (sh_idx++, shDraw()) : closeModal()">
          ${sh_idx < allCards.length - 1 ? "Weiter →" : "Fertig ✓"}
        </button>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-top:10px;">Tastatur: → = weiter · ← = zurück</div>`;
    window.shDraw = shDraw;
    setModalKeys((e) => {
      if (e.key === "ArrowRight" || e.key === "Enter") { e.preventDefault(); if (sh_idx < allCards.length - 1) { sh_idx++; shDraw(); } }
      else if (e.key === "ArrowLeft") { e.preventDefault(); if (sh_idx > 0) { sh_idx--; shDraw(); } }
      else if (e.key === "Escape") closeModal();
    });
  }
  shDraw();
}

// ================================================================
// WOCHE 4 – SELF-EXPLANATION
// ================================================================
function renderSelfExplain() {
  let se_idx = 0;
  const cards = W4_CONCEPTS.slice().sort(() => Math.random() - 0.5);

  function draw() {
    const c = cards[se_idx];
    document.getElementById("modalContent").innerHTML = `
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
        <div class="modal-title" style="margin:0;">🦆 Self-Explanation</div>
        <span class="fc-pill">${se_idx + 1}/${cards.length}</span>
      </div>
      <div class="modal-subtitle" style="margin-bottom:16px;">Begriff sehen → laut erklären → Musterantwort vergleichen</div>
      <div class="fc-card" style="text-align:center;margin-bottom:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:6px;">Begriff</div>
        <div style="font-size:36px;font-weight:900;color:var(--navy);font-family:var(--font-display);text-transform:uppercase;letter-spacing:0.05em;">${c.term}</div>
        <div style="font-size:15px;color:var(--muted);margin-top:4px;">${c.de}</div>
      </div>
      <div style="background:var(--gold-light);border-left:3px solid var(--gold);border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:14px;color:var(--navy);">
        <strong>🎙️ Jetzt laut sprechen:</strong><br>
        <span style="color:var(--muted);">① Was bedeutet <em>${c.term}</em>?  &nbsp;② Konkretes Beispiel?  &nbsp;③ Geschäftliche Wirkung?</span>
      </div>
      <div id="seAnswer" style="display:none;">
        <div style="background:var(--surface2);border-radius:10px;padding:14px 16px;margin-bottom:12px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:8px;">Musterantwort</div>
          <div style="font-size:15px;color:var(--navy);margin-bottom:6px;"><strong>Was:</strong> ${c.why}</div>
          <div style="font-size:15px;color:var(--navy);margin-bottom:6px;"><strong>Beispiel:</strong> <em>"${c.example}"</em></div>
          <div style="font-size:15px;color:var(--navy);"><strong>Wirkung:</strong> ${c.impact}</div>
        </div>
        <div style="background:var(--bg);border:2px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:16px;">
          <div style="font-size:12px;font-weight:700;color:var(--gold);margin-bottom:4px;">💡 ${c.why_not}</div>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <button class="btn-secondary" onclick="renderSelfExplain()">↩ Neu mischen</button>
          <button class="btn-primary" id="seNext" onclick="se_idx < ${cards.length - 1} ? (se_idx++, seDrawCall()) : renderSelfExplain()">
            ${se_idx < cards.length - 1 ? "Nächster Begriff →" : "🔄 Nochmal"}
          </button>
        </div>
      </div>
      <div id="seRevealWrap">
        <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('seAnswer').style.display='block';document.getElementById('seRevealWrap').style.display='none';">
          Musterantwort aufdecken
        </button>
        <div style="font-size:12px;color:var(--muted);margin-top:8px;text-align:center;">Erst laut sprechen · A = aufdecken</div>
      </div>`;
    setModalKeys(e => {
      if ((e.key === "a" || e.key === "A") && document.getElementById("seRevealWrap").style.display !== "none") {
        document.getElementById("seAnswer").style.display = "block";
        document.getElementById("seRevealWrap").style.display = "none";
      }
      if (e.key === "Enter") { const btn = document.getElementById("seNext"); if (btn) btn.click(); }
      if (e.key === "Escape") closeModal();
    });
  }
  window.seDrawCall = draw;
  draw();
}

// ================================================================
// WOCHE 4 – WARUM-KARTEN (Elaborative Interrogation)
// ================================================================
function renderWhyCards() {
  let wc_idx = 0;
  const cards = W4_CONCEPTS.slice().sort(() => Math.random() - 0.5);

  function draw() {
    const c        = cards[wc_idx];
    const question = c.why_not.split("?")[0] + "?";
    const answer   = c.why_not.split("? ")[1] || c.why_not;
    document.getElementById("modalContent").innerHTML = `
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
        <div class="modal-title" style="margin:0;">❓ Warum-Karten</div>
        <span class="fc-pill">${wc_idx + 1}/${cards.length}</span>
      </div>
      <div class="modal-subtitle" style="margin-bottom:16px;">Begründungsfragen: Warum dieses Wort – und nicht ein anderes?</div>
      <div class="fc-card" style="text-align:center;margin-bottom:16px;">
        <div style="font-size:13px;color:var(--muted);margin-bottom:8px;">Elaborative Interrogation</div>
        <div style="font-size:20px;font-weight:700;color:var(--navy);line-height:1.4;">${question}</div>
      </div>
      <div id="wcReveal" style="display:none;">
        <div style="background:var(--surface2);border-radius:10px;padding:14px 16px;margin-bottom:12px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Antwort</div>
          <div style="font-size:16px;font-weight:700;color:var(--navy);">${answer}</div>
        </div>
        <div style="background:var(--gold-light);border-left:3px solid var(--gold);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:var(--navy);">
          <strong>Einprägen:</strong> "${c.term}" → ${c.de} → <em>${c.example}</em>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button class="btn-secondary" onclick="renderWhyCards()">↩ Neu mischen</button>
          <button class="btn-primary" id="wcNext" onclick="wc_idx < ${cards.length - 1} ? (wc_idx++, wcDrawCall()) : renderWhyCards()">
            ${wc_idx < cards.length - 1 ? "Nächste Frage →" : "🔄 Nochmal"}
          </button>
        </div>
      </div>
      <div id="wcRevealWrap">
        <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('wcReveal').style.display='block';document.getElementById('wcRevealWrap').style.display='none';">
          Antwort aufdecken (A)
        </button>
      </div>`;
    setModalKeys(e => {
      if ((e.key === "a" || e.key === "A") && document.getElementById("wcRevealWrap").style.display !== "none") {
        document.getElementById("wcReveal").style.display = "block";
        document.getElementById("wcRevealWrap").style.display = "none";
      }
      if (e.key === "Enter") { const b = document.getElementById("wcNext"); if (b) b.click(); }
      if (e.key === "Escape") closeModal();
    });
  }
  window.wcDrawCall = draw;
  draw();
}

// ================================================================
// WOCHE 4 – FRAMING
// ================================================================
function renderFraming() {
  let fr_idx = 0;
  const cards = W4_FRAMING.slice().sort(() => Math.random() - 0.5);

  function draw() {
    const c = cards[fr_idx];
    document.getElementById("modalContent").innerHTML = `
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;">
        <div class="modal-title" style="margin:0;">🖼️ Framing</div>
        <span class="fc-pill">${fr_idx + 1}/${cards.length}</span>
      </div>
      <div class="modal-subtitle" style="margin-bottom:16px;">Neutrale Aussage → wirkungsvolle Version formulieren</div>
      <div style="background:var(--bg);border:2px solid var(--red);border-radius:12px;padding:16px 18px;margin-bottom:12px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--red);font-weight:700;margin-bottom:6px;">Neutral / schwach</div>
        <div style="font-size:18px;font-weight:700;color:var(--navy);">"${c.neutral}"</div>
      </div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:10px;">Formuliere jetzt laut eine wirkungsvolle Version. Dann aufdecken und vergleichen.</div>
      <div id="frReveal" style="display:none;">
        <div style="background:var(--bg);border:2px solid #2a7a2a;border-radius:12px;padding:16px 18px;margin-bottom:12px;">
          <div style="font-size:11px;text-transform:uppercase;color:#2a7a2a;font-weight:700;margin-bottom:6px;">✓ Muster-Framing</div>
          <div style="font-size:17px;font-weight:700;color:var(--navy);">"${c.framed}"</div>
        </div>
        <div style="background:var(--gold-light);border-left:3px solid var(--gold);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:var(--navy);">
          <strong>Technik:</strong> ${c.tip}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button class="btn-secondary" onclick="renderFraming()">↩ Neu mischen</button>
          <button class="btn-primary" id="frNext" onclick="fr_idx < ${cards.length - 1} ? (fr_idx++, frDrawCall()) : renderFraming()">
            ${fr_idx < cards.length - 1 ? "Nächste Aussage →" : "🔄 Nochmal"}
          </button>
        </div>
      </div>
      <div id="frRevealWrap">
        <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('frReveal').style.display='block';document.getElementById('frRevealWrap').style.display='none';">
          Muster aufdecken (A)
        </button>
      </div>`;
    setModalKeys(e => {
      if ((e.key === "a" || e.key === "A") && document.getElementById("frRevealWrap") && document.getElementById("frRevealWrap").style.display !== "none") {
        document.getElementById("frReveal").style.display = "block";
        document.getElementById("frRevealWrap").style.display = "none";
      }
      if (e.key === "Enter") { const b = document.getElementById("frNext"); if (b) b.click(); }
      if (e.key === "Escape") closeModal();
    });
  }
  window.frDrawCall = draw;
  draw();
}

// ================================================================
// WOCHE 4 – NYC PITCH SIMULATION
// ================================================================
function renderNYCPitch() {
  let pt_idx = 0;

  function draw() {
    const s      = NYC_PITCH_SCENES[pt_idx];
    const isLast = pt_idx === NYC_PITCH_SCENES.length - 1;
    document.getElementById("modalContent").innerHTML = `
      <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:4px;flex-wrap:wrap;">
        <div class="modal-title" style="margin:0;">🗽 NYC Pitch Simulation</div>
        <span class="fc-pill">Szene ${pt_idx + 1}/${NYC_PITCH_SCENES.length}</span>
      </div>
      <div style="background:linear-gradient(135deg,#1e3c7a,#2a5298);border-radius:12px;padding:14px 18px;margin-bottom:14px;color:#fff;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.7;margin-bottom:4px;">${s.scene}</div>
        <div style="font-size:13px;opacity:0.85;line-height:1.5;">${s.setup}</div>
      </div>
      <div style="background:var(--bg);border:2px solid var(--navy);border-radius:12px;padding:16px 18px;margin-bottom:14px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:6px;">Investor sagt:</div>
        <div style="font-size:17px;font-weight:700;color:var(--navy);font-style:italic;">"${s.investor}"</div>
      </div>
      <div style="background:var(--gold-light);border-left:3px solid var(--gold);border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:13px;color:var(--navy);">
        <strong>💡 Hinweis:</strong> ${s.hint}
      </div>
      <div id="ptReveal" style="display:none;">
        <div style="background:var(--bg);border:2px solid #2a7a2a;border-radius:12px;padding:16px 18px;margin-bottom:10px;">
          <div style="font-size:11px;text-transform:uppercase;color:#2a7a2a;font-weight:700;margin-bottom:6px;">✓ Musterantwort</div>
          <div style="font-size:16px;font-weight:700;color:var(--navy);font-style:italic;">"${s.model}"</div>
        </div>
        <div style="background:var(--surface2);border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:var(--muted);">
          <strong>Technik:</strong> ${s.technique}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <button class="btn-secondary" onclick="renderNYCPitch()">↩ Von vorne</button>
          ${isLast
            ? `<button class="btn-primary" onclick="renderPitchComplete()">🏆 Pitch abgeschlossen!</button>`
            : `<button class="btn-primary" id="ptNext" onclick="pt_idx++;ptDrawCall()">Nächste Szene →</button>`}
        </div>
      </div>
      <div id="ptRevealWrap">
        <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('ptReveal').style.display='block';document.getElementById('ptRevealWrap').style.display='none';">
          Meine Antwort vergleichen (A)
        </button>
      </div>
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
        <div style="display:flex;gap:6px;justify-content:center;">
          ${NYC_PITCH_SCENES.map((_, i) => `<div style="width:10px;height:10px;border-radius:50%;background:${i < pt_idx ? "#2a7a2a" : i === pt_idx ? "var(--navy)" : "var(--border)"};transition:background 0.2s;"></div>`).join("")}
        </div>
      </div>`;
    setModalKeys(e => {
      if ((e.key === "a" || e.key === "A") && document.getElementById("ptRevealWrap") && document.getElementById("ptRevealWrap").style.display !== "none") {
        document.getElementById("ptReveal").style.display = "block";
        document.getElementById("ptRevealWrap").style.display = "none";
      }
      if (e.key === "Enter") { const b = document.getElementById("ptNext") || document.querySelector("#ptReveal .btn-primary"); if (b) b.click(); }
      if (e.key === "Escape") closeModal();
    });
  }
  window.ptDrawCall = draw;
  draw();
}

function renderPitchComplete() {
  markExerciseDone("pitch_nyc");
  updateStreakForToday();
  document.getElementById("modalContent").innerHTML = `
    <div style="text-align:center;padding:32px 16px;">
      <div style="font-size:60px;margin-bottom:12px;">🗽🏆</div>
      <div style="font-family:var(--font-display);font-size:28px;font-weight:900;text-transform:uppercase;color:var(--navy);margin-bottom:8px;">Pitch bestanden!</div>
      <div style="font-size:15px;color:var(--muted);margin-bottom:20px;line-height:1.6;">
        Alle 5 Szenen. Framing, Chunking, Self-Explanation, Elaborative Interrogation, Signposting.<br>
        <strong style="color:var(--navy);">Das ist das vollständige Toolkit.</strong>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="btn-secondary" onclick="closeModal()">Schließen</button>
        <button class="btn-primary" onclick="renderNYCPitch()">🔄 Pitch wiederholen</button>
      </div>
    </div>`;
  updateSRSBadge();
}

// ================================================================
// SRS QUEUE – Heute wiederholen
// ================================================================
function openSRSQueue() {
  const due = getDueCards();
  if (due.length === 0) {
    overlay.classList.add("open");
    document.getElementById("modalContent").innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:52px;margin-bottom:12px;">🎉</div>
        <div style="font-family:var(--font-display);font-size:28px;font-weight:900;text-transform:uppercase;color:var(--navy);margin-bottom:8px;">Alles erledigt!</div>
        <div style="font-size:15px;color:var(--muted);margin-bottom:24px;">Keine fälligen Wiederholungen heute. Kommen Sie morgen wieder!</div>
        <div style="font-size:13px;color:var(--muted);background:var(--bg);border-radius:12px;padding:16px;">
          🔥 Streak: <strong>${_userData.streak_current || 0} Tag(e)</strong> · ✓ Gesamt korrekt: <strong>${_userData.total_correct || 0}/${_userData.total_reviews || 0}</strong>
        </div>
        <button class="btn-secondary" style="margin-top:20px;" onclick="closeModal()">Schließen</button>
      </div>`;
    return;
  }
  renderSRSQueue(due);
}

function renderSRSQueue(dueCards) {
  overlay.classList.add("open");
  const cards        = dueCards.slice().sort(() => Math.random() - 0.5);
  let   srs_idx      = 0;
  let   srs_correct  = 0;
  const sessionStart = Date.now();

  function drawSRS() {
    if (srs_idx >= cards.length) {
      const duration = Math.round((Date.now() - sessionStart) / 1000);
      logSession("srs", "all", cards.length, srs_correct, duration);
      markExerciseDone("srs_session");
      document.getElementById("modalContent").innerHTML = `
        <div style="text-align:center;padding:36px 20px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <div style="font-family:var(--font-display);font-size:28px;font-weight:900;text-transform:uppercase;color:var(--navy);margin-bottom:6px;">Session fertig!</div>
          <div style="font-size:15px;color:var(--muted);margin-bottom:20px;">${cards.length} Karten · ${srs_correct} korrekt · ${Math.round(srs_correct / cards.length * 100)}%</div>
          <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
            <div style="background:var(--bg);border-radius:12px;padding:14px 20px;text-align:center;">
              <div style="font-size:24px;font-weight:900;color:var(--navy);">🔥 ${_userData.streak_current || 0}</div>
              <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Streak</div>
            </div>
            <div style="background:var(--bg);border-radius:12px;padding:14px 20px;text-align:center;">
              <div style="font-size:24px;font-weight:900;color:var(--navy);">${_userData.total_reviews || 0}</div>
              <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Gesamt Reviews</div>
            </div>
            <div style="background:var(--bg);border-radius:12px;padding:14px 20px;text-align:center;">
              <div style="font-size:24px;font-weight:900;color:var(--navy);">${getWeakCards().length}</div>
              <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;">Schwache Phrasen</div>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
            <button class="btn-secondary" onclick="closeModal()">Schließen</button>
            <button class="btn-primary" onclick="openWeakCards()">Schwache Phrasen üben</button>
          </div>
        </div>`;
      updateSRSBadge();
      return;
    }

    const card    = cards[srs_idx];
    const review  = card._review;
    const cardId  = card._cardId;
    document.getElementById("modalContent").innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <div class="modal-title" style="margin:0;">Spaced Repetition</div>
        <span class="fc-pill">${srs_idx + 1}/${cards.length} · ${srs_correct} ✓</span>
      </div>
      <div class="fc-card" style="gap:10px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);">
          🇩🇪 Deutsch → Englisch sprechen
          ${review ? `<span style="float:right;color:var(--muted);font-weight:400;">×${review.correct_count || 0}✓ ×${(review.wrong_count || 0) + (review.again_count || 0)}✗</span>` : '<span style="float:right;color:var(--gold);font-weight:600;">Neue Karte</span>'}
        </div>
        <div style="font-size:22px;font-weight:700;color:var(--navy);line-height:1.3;" id="srsQ">${card.a}</div>
        <div id="srsAnswer" style="display:none;">
          <div class="fc-label">Englisch</div>
          <div style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:8px;">${card.q}</div>
          ${card.example ? `<div style="font-size:13px;color:var(--muted);font-style:italic;border-left:3px solid var(--gold);padding-left:10px;">${card.example}</div>` : ""}
        </div>
      </div>
      <div id="srsShowBtn" style="margin-top:14px;text-align:center;">
        <button class="btn-primary" style="width:100%;justify-content:center;" onclick="document.getElementById('srsAnswer').style.display='block';document.getElementById('srsShowBtn').style.display='none';document.getElementById('srsRateArea').style.display='block';">
          Antwort zeigen (A)
        </button>
      </div>
      <div id="srsRateArea" style="display:none;margin-top:14px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-bottom:8px;text-align:center;">Wie leicht war das?</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="srsRate(0)" style="flex:1;min-width:70px;padding:11px 6px;border-radius:10px;border:2px solid #ef4444;background:#fef2f2;color:#dc2626;font-weight:700;cursor:pointer;font-size:13px;">🔁<br><span style="font-size:10px;">Nochmal</span></button>
          <button onclick="srsRate(1)" style="flex:1;min-width:70px;padding:11px 6px;border-radius:10px;border:2px solid #f97316;background:#fff7ed;color:#ea580c;font-weight:700;cursor:pointer;font-size:13px;">😬<br><span style="font-size:10px;">Schwer</span></button>
          <button onclick="srsRate(2)" style="flex:1;min-width:70px;padding:11px 6px;border-radius:10px;border:2px solid #22c55e;background:#f0fdf4;color:#16a34a;font-weight:700;cursor:pointer;font-size:13px;">👍<br><span style="font-size:10px;">Gut</span></button>
          <button onclick="srsRate(3)" style="flex:1;min-width:70px;padding:11px 6px;border-radius:10px;border:2px solid #3b82f6;background:#eff6ff;color:#2563eb;font-weight:700;cursor:pointer;font-size:13px;">⚡<br><span style="font-size:10px;">Leicht</span></button>
        </div>
        <div style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;">Tastatur: A = Antwort · 1 Nochmal · 2 Schwer · 3 Gut · 4 Leicht</div>
      </div>`;

    setModalKeys(e => {
      if (e.key.toLowerCase() === "a") { e.preventDefault(); const b = document.getElementById("srsShowBtn"); if (b.style.display !== "none") b.querySelector("button").click(); }
      else if (e.key === "1") { e.preventDefault(); srsRate(0); }
      else if (e.key === "2") { e.preventDefault(); srsRate(1); }
      else if (e.key === "3") { e.preventDefault(); srsRate(2); }
      else if (e.key === "4") { e.preventDefault(); srsRate(3); }
      else if (e.key === "Escape") closeModal();
    });
  }

  window.srsRate = function (grade) {
    const card = cards[srs_idx];
    if (!card) return;
    if (grade >= 2) srs_correct++;
    recordCardReview(card._cardId, card._deck || "all", grade);
    srs_idx++;
    setTimeout(drawSRS, 150);
  };
  drawSRS();
}

// ================================================================
// WEAK CARDS
// ================================================================
function openWeakCards() {
  const weak = getWeakCards(20);
  if (weak.length === 0) {
    overlay.classList.add("open");
    document.getElementById("modalContent").innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:48px;margin-bottom:12px;">💪</div>
        <div style="font-family:var(--font-display);font-size:24px;font-weight:900;color:var(--navy);margin-bottom:8px;">Keine schwachen Phrasen!</div>
        <div style="font-size:14px;color:var(--muted);margin-bottom:20px;">Üben Sie mehr Karten um schwache Phrasen zu identifizieren.</div>
        <button class="btn-secondary" onclick="closeModal()">Schließen</button>
      </div>`;
    return;
  }
  renderFlashcards(weak, 0, "weak");
  const t = document.querySelector(".modal-title");
  if (t) t.textContent = `Schwache Phrasen (${weak.length})`;
  const s = document.querySelector(".modal-subtitle");
  if (s) s.textContent = "Die Phrasen mit den meisten Fehlern – gezielte Wiederholung";
}

// ================================================================
// SOFTENER TRAINER (Woche 2: Ton & Flexibilität)
// ================================================================
function renderSoftenerTrainer(cards) {
  let idx = 0;
  let stats = { correct: 0, total: 0 };
  
  function draw() {
    const card = cards[idx];
    
    document.getElementById("modalContent").innerHTML = `
      <div class="modal-title">SOFTENER-TRAINER</div>
      <div class="modal-subtitle">Höflich formulieren · Karte ${idx + 1}/${cards.length}</div>
      
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; font-weight: 600;">
          ⚠️ Zu direkt:
        </div>
        <div style="font-size: 20px; font-weight: 700; color: #dc2626; font-family: var(--font-display);">
          "${card.roh}"
        </div>
        ${card.kontext ? `
          <div style="font-size: 12px; color: var(--muted); margin-top: 8px; font-style: italic;">
            💼 ${card.kontext}
          </div>
        ` : ''}
      </div>
      
      <div id="softenerChoices" style="margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 600; color: var(--primary); margin-bottom: 12px; text-align: center;">
          Welche Softener-Technik möchtest du nutzen?
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button onclick="showSoftener('dank')" class="softener-btn" style="padding: 14px; border: 2px solid var(--border); background: white; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
            🙏 DANK
          </button>
          <button onclick="showSoftener('bitte')" class="softener-btn" style="padding: 14px; border: 2px solid var(--border); background: white; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
            🙏🏻 BITTE
          </button>
          <button onclick="showSoftener('frage')" class="softener-btn" style="padding: 14px; border: 2px solid var(--border); background: white; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
            ❓ FRAGE
          </button>
          <button onclick="showSoftener('perspektive')" class="softener-btn" style="padding: 14px; border: 2px solid var(--border); background: white; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
            👁️ PERSPEKTIVE
          </button>
        </div>
      </div>
      
      <div id="softenerResult" style="display: none;"></div>
      
      <div id="softenerNav" style="display: none; margin-top: 20px;">
        <button class="btn btn-primary" style="width: 100%;" onclick="nextSoftener()">
          ${idx < cards.length - 1 ? 'Weiter →' : '✓ Fertig'}
        </button>
      </div>
    `;
    
    // Hover-Effekt für Buttons
    document.querySelectorAll('.softener-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = 'var(--primary)';
        btn.style.transform = 'scale(1.02)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = 'var(--border)';
        btn.style.transform = 'scale(1)';
      });
    });
    
    // Global Functions
    window.showSoftener = (type) => {
      const typeNames = {
        'dank': 'Dank',
        'bitte': 'Bitte',
        'frage': 'Frage',
        'perspektive': 'Perspektive'
      };
      
      const icons = {
        'dank': '🙏',
        'bitte': '🙏🏻',
        'frage': '❓',
        'perspektive': '👁️'
      };
      
      document.getElementById('softenerChoices').style.display = 'none';
      document.getElementById('softenerResult').style.display = 'block';
      document.getElementById('softenerNav').style.display = 'block';
      
      document.getElementById('softenerResult').innerHTML = `
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; font-weight: 600;">
            ${icons[type]} ${typeNames[type]}-Technik:
          </div>
          <div style="font-size: 18px; font-weight: 700; color: #16a34a;">
            "${card[type]}"
          </div>
        </div>
        
        <details style="margin-top: 16px; padding: 12px; background: var(--bg); border-radius: 8px; cursor: pointer;">
          <summary style="font-weight: 600; color: var(--primary); font-size: 13px;">
            Alle 4 Varianten ansehen
          </summary>
          <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="padding: 8px; background: white; border-radius: 6px;">
              <div style="font-size: 10px; color: var(--muted); font-weight: 600;">🙏 DANK</div>
              <div style="font-size: 13px;">"${card.dank}"</div>
            </div>
            <div style="padding: 8px; background: white; border-radius: 6px;">
              <div style="font-size: 10px; color: var(--muted); font-weight: 600;">🙏🏻 BITTE</div>
              <div style="font-size: 13px;">"${card.bitte}"</div>
            </div>
            <div style="padding: 8px; background: white; border-radius: 6px;">
              <div style="font-size: 10px; color: var(--muted); font-weight: 600;">❓ FRAGE</div>
              <div style="font-size: 13px;">"${card.frage}"</div>
            </div>
            <div style="padding: 8px; background: white; border-radius: 6px;">
              <div style="font-size: 10px; color: var(--muted); font-weight: 600;">👁️ PERSPEKTIVE</div>
              <div style="font-size: 13px;">"${card.perspektive}"</div>
            </div>
          </div>
        </details>
      `;
      
      stats.total++;
    };
    
    window.nextSoftener = () => {
      if (idx < cards.length - 1) {
        idx++;
        draw();
      } else {
        // Fertig!
        document.getElementById("modalContent").innerHTML = `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 60px; margin-bottom: 16px;">🎉</div>
            <div style="font-family: var(--font-display); font-size: 28px; font-weight: 900; text-transform: uppercase; color: var(--primary); margin-bottom: 12px;">
              Gut gemacht!
            </div>
            <div style="font-size: 16px; color: var(--muted); margin-bottom: 24px;">
              Du hast alle ${cards.length} Situationen gemeistert!
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="font-size: 13px; color: var(--muted); margin-bottom: 8px;">Techniken geübt</div>
              <div style="font-size: 32px; font-weight: 900; color: var(--primary);">${stats.total}</div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="btn" style="background: var(--muted); color: white;" onclick="renderSoftenerTrainer(${JSON.stringify(cards).replace(/"/g, '&quot;')})">
                🔄 Nochmal
              </button>
              <button class="btn btn-primary" onclick="closeModal()">
                ✓ Fertig
              </button>
            </div>
          </div>
        `;
      }
    };
  }
  
  draw();
}
