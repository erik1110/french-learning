# 法文學習網站 · French Learning

一個學習法文的網站，提供 **A1 / A2 / B1** 的單字卡、文法教學與情境對話。
**純前端架構**，所有資料直接打包進網站，可免費部署到 GitHub Pages（不需後端與資料庫）。

- **前端**：React 18 + Vite（讀取打包好的 JSON 資料）
- **發音**：瀏覽器內建 Web Speech API（免費、免金鑰）
- **個人資料**：單字庫與自訂單字卡存在瀏覽器 **localStorage**

## 功能

| 分頁 | 說明 |
| --- | --- |
| 📇 單字卡 | A1（515 字）、A2（503 字）、B1（200 字），翻面看翻譯與例句、名詞標示陰／陽性、🔊 唸單字與例句、可新增自訂單字卡 |
| 🎲 隨機複習 | 依程度或單字庫範圍隨機抽卡複習 |
| ⭐ 我的單字庫 | 在任何卡片點 ☆ 標示不熟的單字；自訂卡片可隨時編輯／刪除（存 localStorage） |
| 🔢 單元主題 | 數字 0–100、時鐘、星期、月份、日期、金錢、基本句型等，每句可單獨或一次全部發音 |
| 📖 文法教學 | A1/A2 各 10 個文法主題，含中文講解與**可發音的法文例句** |
| 💬 情境對話 | 56 個情境（餐廳、購物、交通、同事閒聊、抱怨、八卦、嗆聲…），每句可單獨或一次全部發音，並附重點教學 |

## 專案結構

```
french-learning/
├── frontend/                    React + Vite
│   ├── src/
│   │   ├── App.jsx              分頁 UI 與所有功能
│   │   ├── store.js             載入 JSON 資料 + localStorage + 數字產生器
│   │   ├── speech.js            Web Speech API 發音（單句 / 整段）
│   │   └── data/                單字、文法、對話、單元主題的 JSON 資料
│   └── vite.config.js           base: './'（GitHub Pages 子路徑可用）
└── .github/workflows/deploy.yml GitHub Actions：自動建置並部署到 Pages
```

## 本機開發

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

建置靜態網站：

```bash
npm run build    # 產出在 frontend/dist/
npm run preview  # 本機預覽建置結果
```

## 部署到 GitHub Pages

已內建 `.github/workflows/deploy.yml`：推送到 `main` 後會自動建置 `frontend` 並部署到 Pages。
只需到 GitHub 倉庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions** 一次即可。

## 編輯內容（都在 `frontend/src/data/`）

- 單字：`a1.json` + `a1_extra.json`、`a2.json` + `a2_extra.json`、`b1.json`
  （欄位：`french`、`translation`、`gender`(m/f/null)、`partOfSpeech`、`example`、`exampleTranslation`）
- 文法：`grammar.json`（`level`、`title`、`summary`、`content`、`orderIndex`、`examples[]`）
- 情境對話：`dialogues.json`（`category`、`title`、`scene`、`lines[]`、`keyPoints[]`）
- 單元主題：`units.json`（`title`、`intro`、`items[]`）；數字 0–100 由 `store.js` 自動產生

改完重新 `npm run build` 即可。

## 待辦

- B1 單字目前 200 字，預計再補 300 字（放到 `b1_extra.json` 並於 `store.js` 匯入即可）。
