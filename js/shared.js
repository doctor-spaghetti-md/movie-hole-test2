const DATA_URL = "/data/movies.json";
const API_BASE = "/.netlify/functions";

function normalizeTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchMovies() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load movies.json");
    const movies = await response.json();
    return Array.isArray(movies) ? movies : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function formatDate(dateString) {
  if (!dateString) return "date unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "date unknown";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function setupNav() {
  const button = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  if (!button || !nav) return;

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
}

setupNav();
