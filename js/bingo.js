const screen = document.getElementById("bingoScreen");
const drawButton = document.getElementById("drawButton");
const markButton = document.getElementById("markSelectedButton");
const bingoMessage = document.getElementById("bingoMessage");
const eligibleList = document.getElementById("eligibleList");
const adminDialog = document.getElementById("adminDialog");
const adminCodeForm = document.getElementById("adminCodeForm");
const adminCodeInput = document.getElementById("adminCodeInput");
const cancelAdminCode = document.getElementById("cancelAdminCode");

let movies = [];
let currentMovie = null;
let isSubmitting = false;

function setBingoMessage(text, type = "info") {
  if (!bingoMessage) return;
  bingoMessage.textContent = text;
  bingoMessage.dataset.type = type;
}

function eligibleMovies() {
  return movies.filter(movie => !movie.selected);
}

function renderEligible() {
  if (!eligibleList) return;
  const eligible = eligibleMovies();

  eligibleList.innerHTML = "";

  if (!eligible.length) {
    eligibleList.innerHTML = `<p class="empty-state">The hole is empty. This is probably a federal issue.</p>`;
    return;
  }

  eligible.forEach(movie => {
    const item = document.createElement("div");
    item.className = "mini-item";
    item.textContent = movie.title;
    eligibleList.append(item);
  });
}

function drawMovie() {
  const eligible = eligibleMovies();

  if (!eligible.length) {
    currentMovie = null;
    if (screen) screen.textContent = "NO MOVIES REMAIN";
    if (markButton) markButton.disabled = true;
    setBingoMessage("No eligible movies are available.", "error");
    return;
  }

  currentMovie = eligible[Math.floor(Math.random() * eligible.length)];
  if (screen) screen.textContent = currentMovie.title;
  if (markButton) markButton.disabled = false;
  setBingoMessage("The hole has spoken.", "success");
}

function openAdminDialog() {
  if (!currentMovie || isSubmitting) return;

  if (!adminDialog || typeof adminDialog.showModal !== "function") {
    const adminCode = window.prompt("Enter admin code to mark this movie as selected:");
    if (adminCode) markSelected(adminCode);
    return;
  }

  if (adminCodeInput) adminCodeInput.value = "";
  adminDialog.showModal();
  setTimeout(() => adminCodeInput?.focus(), 50);
}

async function markSelected(adminCode) {
  if (!currentMovie || isSubmitting) return;

  const code = String(adminCode || "").trim();
  if (!code) {
    setBingoMessage("Admin code required. The hole is not a democracy.", "error");
    return;
  }

  isSubmitting = true;
  if (markButton) markButton.disabled = true;
  setBingoMessage("Verifying code and marking movie as selected...", "info");

  try {
    const response = await fetch(`${API_BASE}/mark-selected`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentMovie.id, adminCode: code })
    });

    const result = await response.json();

    if (!response.ok) {
      setBingoMessage(result.error || "Incorrect code. Uniformed men are mildly disappointed.", "error");
      if (markButton && currentMovie) markButton.disabled = false;
      return;
    }

    movies = result.movies;
    currentMovie = null;
    if (screen) screen.textContent = "UNDETERMINED STATE";
    if (markButton) markButton.disabled = true;
    setBingoMessage("Marked as selected. Security has improved.", "success");
    renderEligible();
  } catch (error) {
    console.error(error);
    setBingoMessage("Could not reach the hole. Check Netlify/GitHub setup.", "error");
    if (markButton && currentMovie) markButton.disabled = false;
  } finally {
    isSubmitting = false;
  }
}

async function init() {
  movies = await fetchMovies();
  renderEligible();
}

if (drawButton) drawButton.addEventListener("click", drawMovie);
if (markButton) markButton.addEventListener("click", openAdminDialog);

if (adminCodeForm) {
  adminCodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = adminCodeInput ? adminCodeInput.value : "";
    if (adminDialog?.open) adminDialog.close();
    markSelected(code);
  });
}

if (cancelAdminCode) {
  cancelAdminCode.addEventListener("click", () => adminDialog?.close());
}

init();
