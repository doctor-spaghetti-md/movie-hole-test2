# Movie Hole

A mobile-friendly static site with Netlify Functions that stores movie suggestions in `data/movies.json` on GitHub.

## Pages

- `index.html` - Frick a Flick movie submission page
- `suggestions.html` - searchable suggestions list
- `bingo-hole.html` - random selector for movies not yet selected
- `events.html` - placeholder events page

## How persistence works

The front end is plain HTML/CSS/JS. The actual writing happens through Netlify Functions:

- `submit-movie.js` checks for duplicates and commits a new movie to `data/movies.json`
- `mark-selected.js` marks a movie as selected after it comes out of the Bingo Hole

This avoids localStorage and keeps the list shared for everyone.

## Netlify environment variables

In Netlify, add these variables:

```txt
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
MOVIES_FILE_PATH=data/movies.json
GITHUB_TOKEN=your-github-personal-access-token
```

The GitHub token needs permission to read and write repository contents.

## Local testing

Install dependencies:

```bash
npm install
```

Run locally with Netlify dev:

```bash
npm run dev
```

The site will still display seeded movie data from `data/movies.json`. Submissions require the environment variables above.

## Notes

The Suggestions page search feature is in `js/suggestions.js`.


## Admin code for Bingo Hole

To require a code before marking a movie as selected, add this Netlify environment variable:

```
MOVIE_HOLE_ADMIN_CODE=whatever-code-you-want
```

The code is checked only inside the Netlify Function, not in browser JavaScript. Do not put the admin code in the front-end files.
