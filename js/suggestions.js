const list = document.getElementById("suggestionsList");
const searchInput = document.getElementById("searchInput");
const totalCount = document.getElementById("totalCount");
const eligibleCount = document.getElementById("eligibleCount");
const selectedCount = document.getElementById("selectedCount");

let allMovies = [];

function renderStats(movies) {
  if (!totalCount || !eligibleCount || !selectedCount) return;
  totalCount.textContent = `${movies.length} total`;
  eligibleCount.textContent = `${movies.filter(movie => !movie.selected).length} eligible`;
  selectedCount.textContent = `${movies.filter(movie => movie.selected).length} selected`;
}

function movieCard(movie) {
  const card = document.createElement("article");
  card.className = "card movie-card";

  const title = document.createElement("h2");
  title.textContent = movie.title;

  const meta = document.createElement("div");
  meta.className = "movie-meta";

  const suggestedBy = document.createElement("span");
  suggestedBy.textContent = movie.suggestedBy ? `Suggested by ${movie.suggestedBy}` : "Suggested by unknown citizen";

  const date = document.createElement("span");
  date.textContent = `Filed ${formatDate(movie.createdAt)}`;

  const status = document.createElement("span");
  status.className = `status-pill ${movie.selected ? "selected" : ""}`;
  status.textContent = movie.selected ? "selected from the hole" : "eligible for the hole";

  meta.append(suggestedBy, date);
  card.append(title, meta, status);

  return card;
}

function renderList() {
  if (!list) return;

  const query = normalizeTitle(searchInput?.value || "");
  const filtered = allMovies.filter(movie => normalizeTitle(movie.title).includes(query));

  list.innerHTML = "";

  if (!filtered.length) {
    const empty = document.createElement("article");
    empty.className = "card empty-state";
    empty.textContent = "Nothing in this part of the hole.";
    list.append(empty);
    return;
  }

  filtered.forEach(movie => list.append(movieCard(movie)));
}

async function init() {
  allMovies = await fetchMovies();
  renderStats(allMovies);
  renderList();
}

if (searchInput) {
  searchInput.addEventListener("input", renderList);
}

init();
