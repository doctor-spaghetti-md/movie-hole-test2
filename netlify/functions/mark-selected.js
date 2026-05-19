const { Octokit } = require("@octokit/rest");

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.MOVIES_FILE_PATH || "data/movies.json";
const TOKEN = process.env.GITHUB_TOKEN;
const ADMIN_CODE = process.env.MOVIE_HOLE_ADMIN_CODE;

function requiredEnv() {
  return OWNER && REPO && TOKEN && ADMIN_CODE;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!requiredEnv()) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing GitHub or admin-code environment variables in Netlify." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const id = String(body.id || "").trim();
    const adminCode = String(body.adminCode || "").trim();

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "Movie id is required." }) };
    }

    if (!adminCode || adminCode !== ADMIN_CODE) {
      return { statusCode: 403, body: JSON.stringify({ error: "Incorrect admin code. Selection denied." }) };
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

    const movieExists = movies.some(movie => movie.id === id);
    if (!movieExists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Movie not found." }) };
    }

    const updatedMovies = movies.map(movie =>
      movie.id === id ? { ...movie, selected: true, selectedAt: new Date().toISOString() } : movie
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: FILE_PATH,
      branch: BRANCH,
      message: `Mark Movie Hole selection`,
      content: Buffer.from(JSON.stringify(updatedMovies, null, 2)).toString("base64"),
      sha: file.data.sha
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ movies: updatedMovies })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not mark selected." }) };
  }
};
