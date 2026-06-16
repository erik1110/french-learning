# French Learning

A website for learning French, covering **A1 / A2 / B1** with flashcards, grammar
lessons, themed units, and situational dialogues. It is a **frontend-only** app —
all content is bundled into the site, so it can be hosted for free on GitHub Pages
(no backend or database required).

- **Frontend:** React 18 + Vite (reads bundled JSON data)
- **Pronunciation:** the browser's built-in Web Speech API (free, no API key)
- **Personal data:** the word bank and custom flashcards are stored in the browser's **localStorage**

## Features

| Tab | Description |
| --- | --- |
| 📇 Flashcards | A1 (515 words), A2 (503 words), B1 (200 words); flip to see the translation and example, nouns are tagged masculine/feminine, 🔊 speak the word and the example, and you can add your own cards |
| 🎲 Random review | Draw a random card to review, scoped by level or by your word bank |
| ⭐ Word bank | Tap ☆ on any card to mark words you don't know yet; custom cards can be edited or deleted anytime (saved in localStorage) |
| 🔢 Themed units | Numbers 0–100, the clock, days, months, dates, money, and basic sentence patterns — each line can be spoken individually or all at once |
| 📖 Grammar | 10 topics each for A1/A2, with explanations and **spoken French examples** |
| 💬 Dialogues | 56 situations (restaurant, shopping, transport, coworker chat, complaints, gossip, trash talk…); each line plays individually or all at once, with key teaching points |

## Project structure

```
french-learning/
├── frontend/                    React + Vite
│   ├── src/
│   │   ├── App.jsx              tabbed UI and all features
│   │   ├── store.js             loads JSON data + localStorage + number generator
│   │   ├── speech.js            Web Speech API pronunciation (single line / whole sequence)
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

- Words: `a1.json` + `a1_extra.json`, `a2.json` + `a2_extra.json`, `b1.json`
  (fields: `french`, `translation`, `gender` (m/f/null), `partOfSpeech`, `example`, `exampleTranslation`)
- Grammar: `grammar.json` (`level`, `title`, `summary`, `content`, `orderIndex`, `examples[]`)
- Dialogues: `dialogues.json` (`category`, `title`, `scene`, `lines[]`, `keyPoints[]`)
- Themed units: `units.json` (`title`, `intro`, `items[]`); numbers 0–100 are generated in `store.js`

Run `npm run build` again after editing.

## To do

- B1 currently has 200 words; another 300 are planned (add `b1_extra.json` and import it in `store.js`, the same way A1/A2 do).
