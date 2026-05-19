const form = document.getElementById("suggestionForm");
const message = document.getElementById("formMessage");

function setMessage(text, type = "info") {
  if (!message) return;
  message.textContent = text;
  message.dataset.type = type;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = form.movieTitle.value.trim();
    const suggestedBy = form.suggestedBy.value.trim();

    if (!title) {
      setMessage("Please put a movie in the hole first.", "error");
      return;
    }

    setMessage("Checking the hole...", "info");

    try {
      const response = await fetch(`${API_BASE}/submit-movie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, suggestedBy })
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "please stop asking for movies we already have on file, you dick. Or you will be removed from this site and reported to the police.", "error");
        return;
      }

      setMessage(`Added "${result.movie.title}" to the hole.`, "success");
      form.reset();
    } catch (error) {
      console.error(error);
      setMessage("The hole is currently jammed. Check your Netlify/GitHub setup or try again.", "error");
    }
  });
}
