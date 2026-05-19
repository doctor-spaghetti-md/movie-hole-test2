const { Octokit } = require("@octokit/rest");

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.MOVIES_FILE_PATH || "data/movies.json";
const TOKEN = process.env.GITHUB_TOKEN;

function normalizeTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function requiredEnv() {
  return OWNER && REPO && TOKEN;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!requiredEnv()) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing GitHub environment variables in Netlify." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const title = String(body.title || "").trim();
    const suggestedBy = String(body.suggestedBy || "").trim();

    if (!title) {
      return { statusCode: 400, body: JSON.stringify({ error: "Movie title is required." }) };
    }

    const octokit = new Octokit({ auth: TOKEN });

    const file = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      ref: BRANCH
    });

    const currentContent = Buffer.from(file.data.content, "base64").toString("utf8");
    const movies = JSON.parse(currentContent);

    const normalized = normalizeTitle(title);
    const duplicate = movies.find(movie => normalizeTitle(movie.title) === normalized);

    if (duplicate) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "please stop asking for movies we already have on file, you dick. Or you will be removed from this site and reported to the police",
          duplicate
        })
      };
    }

    const movie = {
      id: `m_${Date.now()}`,
      title,
      suggestedBy,
      createdAt: new Date().toISOString(),
      selected: false
    };

    const updatedMovies = [movie, ...movies];

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      branch: BRANCH,
      message: `Add Movie Hole suggestion: ${title}`,
      content: Buffer.from(JSON.stringify(updatedMovies, null, 2)).toString("base64"),
      sha: file.data.sha
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ movie, movies: updatedMovies })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "The hole failed to process your request." }) };
  }
};
