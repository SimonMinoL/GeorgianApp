# Georgian Cards

A personal, offline-capable flashcard web app (PWA) for learning Georgian. Data is stored in the browser's `localStorage`; use the **Backup** tab to export/restore it.

## Features
- Alphabet and word flashcards, in both directions (Georgian → English, English → Georgian), with easy/hard modes.
- Methods: Random, Smart (Leitner boxes), and Frequency (most common spoken words first).
- Your own words with pronunciation, category, example sentence; statistics per card.

## Run / deploy
Host the folder on GitHub Pages (or locally: `python -m http.server`). After changing files, bump `VERSION` in `sw.js`.

## Data source and citation
The built-in frequency words (`js/frequency.js`, the first 100 entries) come from, and the full list is included as `spoken-georgian-frequency-v2026-07.csv`:

> **The Spoken Georgian Frequency List**, edition v2026.07. EasyGeorgian Research — Lasse N. and Tamar N.

This list is **not my own research**; all credit for the frequency data belongs to its authors. Please consult the original publication for its license/terms and methodology before redistributing it. The English glosses and categories in `js/frequency.js` were shortened/assigned by hand and may differ from the original.

## Structure
`js/study.js` (study modes), `js/words.js` (word editor), `js/stats.js`, `js/leitner.js` (picking/scheduling), `js/frequency.js` (built-in list), `js/storage.js`, `js/data.js` (alphabet, starter words).
