# IronFit Admin Dashboard — Run Instructions

This is a real React app (built with Vite). It **cannot** be opened directly
in a browser or with Live Server — it needs Node.js to install packages and
run a dev server that compiles the JSX.

## Requirements
- [Node.js](https://nodejs.org) installed (v18 or newer). Check with:
  ```
  node -v
  ```

## Steps
1. Unzip this folder, open a terminal **inside it** (`cd ironfit-admin`).
2. Install dependencies:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. It will print a URL like `http://localhost:5500` — open that in your
   browser (or it opens automatically).

## Connect to your backend
Open `src/App.jsx`, find this line near the top:
```js
const API_BASE_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
```
Replace it with your deployed Google Apps Script Web App URL. Save — the
page auto-refreshes.

Until you do that, the dashboard runs in **demo mode** with sample data, so
you can preview the UI right away.

## Building for real deployment (hosting)
```
npm run build
```
This creates a `dist/` folder with static files you can upload to Netlify,
Vercel, GitHub Pages, or any static host — no Node.js needed on the server
after this step.
