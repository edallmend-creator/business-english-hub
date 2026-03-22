// ================================================================
// NAVIGATION – Tab-Wechsel & Deep Links
// ================================================================

// QR-Code Deep Links:
// ?week=1 → Woche 1 (0-basiert)
// ?week=2 → Woche 2
// ?week=bonus → Bonus-Tab
// ODER:
// #week-1 → Woche 1
// #week-2 → Woche 2
// #week-3 → Woche 3
// #week-4 → Woche 4
// #week-bonus → Bonus

function handleDeepLink() {
  // Erst Hash checken (#week-1, #week-2, etc)
  const hash = window.location.hash.slice(1); // Entferne das #
  if (hash) {
    const hashMap = { 
      "week-1": 0, 
      "week-2": 1, 
      "week-3": 2, 
      "week-4": 3, 
      "week-bonus": 4 
    };
    const idx = hashMap[hash];
    if (idx !== undefined) {
      setTimeout(() => {
        showWeek(idx);
        const navLinks = document.querySelectorAll(".nav-link");
        if (navLinks[idx]) setNavActive(navLinks[idx]);
        document.getElementById("weeks")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
      return;
    }
  }
  
  // Falls kein Hash, dann Query-Params checken (?week=1)
  const params = new URLSearchParams(window.location.search);
  const week = params.get("week");
  if (!week) return;
  const map = { "1": 0, "2": 1, "3": 2, "4": 3, "bonus": 4 };
  const idx = map[week.toLowerCase()];
  if (idx !== undefined) {
    setTimeout(() => {
      showWeek(idx);
      const navLinks = document.querySelectorAll(".nav-link");
      if (navLinks[idx]) setNavActive(navLinks[idx]);
      document.getElementById("weeks")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }
}

// Hash-Change Handler (wenn User #week-2 klickt, sofort updaten)
window.addEventListener('hashchange', handleDeepLink);

function showWeek(i) {
  document.querySelectorAll(".week-panel").forEach((p, j) => p.classList.toggle("active", i === j));
  document.querySelectorAll(".week-tab-btn").forEach((b, j) => b.classList.toggle("active", i === j));
  document.getElementById("weeks").scrollIntoView({ behavior: "smooth", block: "start" });
}

function setNavActive(el) {
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  el.classList.add("active");
}

// ================================================================
// DOWNLOADS MODAL
// ================================================================
function openDownloadsModal() {
  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-title">📥 Alle Downloads</div>
    <div class="modal-subtitle">CSV-Dateien für alle Wochen und Nischen</div>
    
    <div style="margin-bottom:24px;">
      <h3 style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:12px;">Core-Decks (Woche 1-4)</h3>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <a href="data/phrases/week1-core.csv" download class="btn-secondary" style="text-decoration:none;">
          📄 Woche 1 Phrasen (45 Phrasen)
        </a>
        <a href="data/phrases/week2-core.csv" download class="btn-secondary" style="text-decoration:none;">
          📄 Woche 2 Phrasen (58 Phrasen)
        </a>
        <a href="data/phrases/week3-core.csv" download class="btn-secondary" style="text-decoration:none;">
          📄 Woche 3 Phrasen (49 Phrasen)
        </a>
        <a href="data/phrases/week4-core.csv" download class="btn-secondary" style="text-decoration:none;">
          📄 Woche 4 Phrasen (20 Phrasen)
        </a>
        <a href="data/phrases/false-friends.csv" download class="btn-secondary" style="text-decoration:none;">
          📄 False Friends (45 Phrasen)
        </a>
      </div>
    </div>
    
    <div style="margin-bottom:24px;">
      <h3 style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:12px;">Nischen-Decks</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
        <a href="data/phrases/niche-finance.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          💼 Finance (25)
        </a>
        <a href="data/phrases/niche-hr.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          👥 HR (24)
        </a>
        <a href="data/phrases/niche-tech.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          💻 Tech (25)
        </a>
        <a href="data/phrases/niche-sales.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          📈 Sales (30)
        </a>
        <a href="data/phrases/niche-email.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          📧 Email (30)
        </a>
        <a href="data/phrases/niche-presentation.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          🎤 Presentation (27)
        </a>
        <a href="data/phrases/niche-startup.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          🚀 Startup (27)
        </a>
        <a href="data/phrases/niche-customer.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          🎧 Customer (25)
        </a>
        <a href="data/phrases/niche-legal.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          ⚖️ Legal (24)
        </a>
        <a href="data/phrases/niche-healthcare.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          🏥 Healthcare (24)
        </a>
        <a href="data/phrases/niche-manufacturing.csv" download class="btn-secondary" style="text-decoration:none;font-size:13px;">
          🏭 Manufacturing (25)
        </a>
      </div>
    </div>
    
    <div style="background:var(--bg);border-radius:12px;padding:16px;font-size:13px;color:var(--muted);">
      💡 <strong>Tipp:</strong> Die CSV-Dateien können in Excel, Google Sheets oder jedem Text-Editor geöffnet werden. 
      Perfekt zum Ausdrucken oder für eigene Lernkarten!
    </div>
  `;
}
