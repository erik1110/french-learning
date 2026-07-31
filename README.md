# French Learning

A website for learning French, covering **A1 / A2 / B1** with flashcards, spaced
repetition, grammar lessons, themed units, and situational dialogues. It is a
**frontend-only** app — all content is bundled into the site, so it can be hosted
for free on GitHub Pages (no backend or database required).

- **Frontend:** React 18 + Vite (reads bundled JSON data)
- **Pronunciation:** the browser's built-in Web Speech API (free, no API key)
- **Personal data:** word bank, custom cards, review schedule, course progress and
  settings all live in the browser's **localStorage**
- **Every view has its own URL** (`#/cards?level=A1&tag=動物`), so the back button,
  refresh and shared links all work
- **Light / dark / follow-system** colour scheme

## Features

| Section | Description |
| --- | --- |
| 🏠 Home | Today's dashboard: daily-goal ring, study streak, how many cards are due, a one-tap jump into the next unfinished lesson, a 14-day activity chart and quick links |
| 🗺️ Learning path | A structured course from zero to basic conversation — 4 stages / 18 lessons (alphabet & pronunciation → nouns & verbs → describing your world → real-life dialogues). Each lesson bundles its own teaching content plus the relevant grammar topics, themed units, dialogues and vocabulary categories, has a jump list of its sections, and can be marked done |
| 📅 Lesson review | What the teacher covered in class, organised by date — browse via calendar or a searchable list |
| 🔁 Daily review | Spaced repetition over your word bank (or any level): grade each card 不會 / 普通 / 很熟 and it comes back after 1, 2, 4, 8, 16, 32 or 60 days. Keyboard: space to reveal, 1–3 to grade, S to speak |
| 📇 Flashcards | A1 (515 words), A2 (503), B1 (200); filter by level, topic tag, or study state (not started / learning / starred), search inside the level, flip for the translation + example, nouns tagged masculine/feminine, and add your own cards. Rendered in batches so big levels stay fast |
| ✏️ Quiz | Three modes — 法→中, 中→法 and 🎧 listening (pick the word you hear). Scope it to a level, your word bank, or just what's due. Answers feed back into the review schedule. Keyboard: 1–4 to answer, Enter for the next question |
| ⭐ Word bank | Everything you starred plus your custom cards, grouped by mastery (due / not yet reviewed / learning / mastered) |
| 🔢 Themed units | Numbers 0–100, the clock, days, months, dates, money and basic sentence patterns — each line speaks individually or all at once |
| 📘 Grammar | 10 topics each for A1/A2, searchable, with explanations and **spoken French examples** |
| 🔧 Verb conjugation | Conjugation rules (the 3 groups, présent / passé composé / futur) plus a searchable lookup for 20 common verbs, every form speakable |
| 💬 Dialogues | 86 situations (restaurant, shopping, transport, coworker chat, complaints, hotel, repairs, support calls…); each line plays individually or all at once, with key teaching points |
| 🔍 Search | One query across vocabulary, themed units, grammar, verbs, dialogues and class lessons, filterable by result type. Press <kbd>/</kbd> or <kbd>⌘K</kbd> from anywhere |

## Project structure

```
french-learning/
├── frontend/                    React + Vite
│   ├── src/
│   │   ├── App.jsx              app shell: sidebar / bottom nav, top bar, settings
│   │   ├── router.js            hash routing (#/cards?level=A1) — back button + shareable links
│   │   ├── store.js             loads JSON data + localStorage + number generator + search
│   │   ├── srs.js               spaced-repetition schedule, daily stats, study streak
│   │   ├── theme.js             light / dark / follow-system colour scheme
│   │   ├── speech.js            Web Speech API pronunciation (single line / whole sequence)
│   │   ├── ui.jsx               shared components (flashcard, panels, progress, term lists…)
│   │   ├── index.css            design tokens + all component styles (both themes)
│   │   ├── views/               one file per section (Home, Course, Cards, Review, Quiz…)
│   │   └── data/                JSON data: words, grammar, dialogues, themed units
│   └── vite.config.js           base: './' (works under a GitHub Pages sub-path)
└── .github/workflows/deploy.yml GitHub Actions: build and deploy to Pages automatically
```

## Local development

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

Build the static site:

```bash
npm run build    # output in frontend/dist/
npm run preview  # preview the build locally
```

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` is included: every push to `main` builds `frontend`
and deploys it to Pages. You only need to do this once in the repo:
**Settings → Pages → Build and deployment → Source → GitHub Actions**.

## Editing content (all under `frontend/src/data/`)

- Words: `a1.json`, `a2.json`, `b1.json` — one file per level
  (fields: `french`, `translation`, `gender` (m/f/null), `partOfSpeech`, `tag`, `example`, `exampleTranslation`)
- Grammar: `grammar.json` (`level`, `title`, `summary`, `content`, `orderIndex`, `examples[]`)
- Verbs: `verbs.json` (`inf`, `zh`, `group`, `aux`, `pp`, `futureStem`, `present[6]`); passé composé and futur are derived in `store.js`
- Dialogues: `dialogues.json` (`category`, `title`, `scene`, `lines[]`, `keyPoints[]`)
- Themed units: `units.json` (`title`, `intro`, `items[]`); numbers 0–100 are generated in `store.js`
- Learning path: `course.json` — stages containing lessons; lesson `sections[]` either carry
  their own `teach` items or reference existing content by `grammar` (level + orderIndex),
  `unit` (id), `dialogue` (title), or `vocab` (level + tag)

Run `npm run build` again after editing.

## localStorage keys

| Key | What it stores |
| --- | --- |
| `fl_unfamiliar` | ids of starred (word bank) cards |
| `fl_custom_cards` | your own flashcards |
| `fl_course_done` | completed learning-path lessons |
| `fl_srs` | per-card review box + next due date |
| `fl_stats` | reviews / correct / newly learned per day (drives the streak) |
| `fl_goal` | daily review target |
| `fl_theme`, `fl_speech_rate`, `fl_speech_voice` | appearance and pronunciation settings |

## To do

- Vocabulary is being expanded toward 1000 words per level in batches (currently A1 515 / A2 503 / B1 200).
