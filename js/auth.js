// ================================================================
// AUTH – Passwort / Login
// Passwort hier ändern:
// ================================================================
const PASSWORD = "CHAMPION";
const STORAGE_KEY = "be4w_v2_unlocked";

function togglePw() {
  const input = document.getElementById("pwInput");
  const eye = document.getElementById("pwEye");
  if (input.type === "password") { input.type = "text"; eye.textContent = "🙈"; }
  else { input.type = "password"; eye.textContent = "👁"; }
  input.focus();
}

function checkLogin() {
  if (localStorage.getItem(STORAGE_KEY) === "1") unlock();
}

function unlock() {
  document.getElementById("gate").style.display = "none";
  document.getElementById("app").style.display = "block";
  initUserCode();
  handleDeepLink();
  if (!localStorage.getItem("be4w_welcomed")) {
    setTimeout(() => showWelcomePopup(), 800);
  }
}

function showWelcomePopup() {
  document.getElementById("welcomeModal").style.display = "flex";
}

function closeWelcomeModal() {
  localStorage.setItem("be4w_welcomed", "1");
  document.getElementById("welcomeModal").style.display = "none";
}

function tryLogin() {
  const val = document.getElementById("pwInput").value.trim();
  if (val === PASSWORD) {
    localStorage.setItem(STORAGE_KEY, "1");
    document.getElementById("pwError").textContent = "";
    unlock();
  } else {
    document.getElementById("pwError").textContent = "Falsches Passwort. Bitte erneut versuchen.";
    document.getElementById("pwInput").value = "";
    document.getElementById("pwInput").focus();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pwBtn").addEventListener("click", tryLogin);
  document.getElementById("pwInput").addEventListener("keydown", e => {
    if (e.key === "Enter") tryLogin();
  });
  checkLogin();
});
