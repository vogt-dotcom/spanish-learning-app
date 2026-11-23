# ¡Dale! — Spanish practice

A responsive, personal Spanish learning app built from the Spanish Listening Glossary.

**[Open the app](https://vogt-dotcom.github.io/spanish-learning-app/)**

## Learn your way

- 160 glossary entries, with the original meanings, forms heard, regional notes, and references to seven source videos.
- 18 everyday words with original, bundled SVG illustrations.
- Single-answer and multi-answer quizzes, picture vocabulary, listening, written recall, and flashcards.
- Four grammar mini lessons: ser/estar, past tenses, reflexive verbs, and por/para.
- Spaced review at 1, 3, 7, 14, 30, and 60 days; a missed word returns in 10 minutes.
- Daily goals, XP, streaks, saved words, search, deck filters, and progress backups.
- Mobile navigation, keyboard controls, accessible labels, and an offline cache after a successful first visit.

## Data & privacy

The glossary is a **23 November 2026 snapshot**, not a live connection to Google Docs. Future glossary changes need to be incorporated into data.js and deployed. Your Google Doc is not changed by this app.

The public repository and app include the bundled learning vocabulary. Personal study progress is stored only in this browser under dale-progress-v1. There are no accounts, analytics, API keys, or server-side user records. Progress does not sync automatically between devices: export a JSON backup from Progress and import it on another device. Clearing browser data removes local progress.

The interface uses Google Fonts when available, with local system-font fallbacks. Speech playback uses the browser/device speech service; Spanish voice availability and offline speech depend on the device. A single-answer quiz tests the contextual meaning retained in the glossary; translations can have other valid meanings outside that context.

Sources based on automatic captions or AI transcription can contain errors. See the in-app source register. Additional essentials and grammar content were authored for the app. SVG vocabulary illustrations were created for this app.

## Run locally

No installation or build step is needed:

    python3 -m http.server 4173

Open http://localhost:4173. Avoid opening index.html directly as a file: service workers and browser storage require a supported web origin.

Run the regression checks with Node.js 22 or later:

    node tests/core.test.cjs

Tests cover answer scoring, answer uniqueness, curriculum integrity, spaced repetition, streak dates, and backup validation.

## GitHub Pages

In repository Settings → Pages, choose **GitHub Actions** as the publishing source. The included workflow validates the curriculum, stages only the public app files, and deploys them on pushes to main. No secrets are required.

The deployment follows [GitHub’s Pages workflow](https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically).

## Update the app

- UI and behavior: index.html, styles.css, app.js, and core.js.
- Vocabulary, sources, and grammar: data.js.
- Images: assets/.
- Update the CACHE version in sw.js whenever cached app files change. Keep FILES in sync with new image files.
- Run the tests and check desktop/mobile layouts before publishing.

Completed answers save immediately. Leaving or reloading ends the current quiz, while completed answer progress remains saved. Flashcard ratings are self-assessed; quiz accuracy and word-review accuracy are displayed separately.

## Keyboard

Use 1–4 to choose options, Enter to check/continue, and Space to flip flashcards. Accents matter in written recall; leading/trailing whitespace and sentence punctuation are ignored.
