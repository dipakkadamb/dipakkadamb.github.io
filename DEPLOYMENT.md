# 🚀 Deployment Guide — Dipak Kadam Portfolio

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → Open http://localhost:5173
```

---

## GitHub Pages Deployment (Step-by-Step)

### Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Name it: `dipak-kadam-portfolio` (or any name)
3. Make it **Public**
4. Do NOT initialize with README

### Step 2: Update `vite.config.js`
Set `base` to match your **exact** GitHub repo name:

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/dipak-kadam-portfolio/',   // ← Replace with YOUR repo name
})
```

### Step 3: Initialize Git and Push Code

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dipak-kadam-portfolio.git
git push -u origin main
```

### Step 4: Deploy to GitHub Pages

```bash
npm run deploy
```

This command:
1. Runs `npm run build` (creates the `dist/` folder)
2. Pushes the `dist/` folder to a `gh-pages` branch via the `gh-pages` package

### Step 5: Enable GitHub Pages
1. Go to your GitHub repo → **Settings** → **Pages**
2. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Click **Save**

### Step 6: Access Your Live Portfolio
After ~2 minutes, your portfolio will be live at:
```
https://YOUR_USERNAME.github.io/dipak-kadam-portfolio/
```

---

## Updating the Portfolio

Whenever you make changes:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
npm run deploy
```

---

## Add Your CV (PDF)

1. Place your CV file as `public/dipak-kadam-cv.pdf`
2. In `App.jsx`, find the "Download CV" button and update:

```jsx
<a
  href="/dipak-kadam-portfolio/dipak-kadam-cv.pdf"
  download="Dipak_Kadam_CV.pdf"
  className="btn-secondary text-base px-8 py-3.5"
>
  Download CV
</a>
```

---

## Connect Contact Form

The contact form is currently a local state demo. To make it functional:

**Option A — Formspree (easiest, free):**
1. Sign up at https://formspree.io
2. Create a form and get your endpoint
3. Replace the `handleSubmit` function in the Contact section:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  if (res.ok) setSent(true)
}
```

**Option B — Zoho Forms (recommended for brand consistency):**
- Embed a Zoho Form iframe in the Contact section

---

## Custom Domain (Optional)

1. Buy a domain (e.g., `dipakkadam.dev`)
2. In `public/`, create a file called `CNAME` with just:
   ```
   dipakkadam.dev
   ```
3. Configure DNS: Add a CNAME record pointing to `YOUR_USERNAME.github.io`
4. Update `vite.config.js` base to `'/'`

---

## Project Structure

```
dipak-portfolio/
├── public/
│   └── favicon.svg         ← Add your favicon here
├── src/
│   ├── App.jsx             ← All components & data
│   ├── index.css           ← Global styles + Tailwind
│   └── main.jsx            ← React entry point
├── index.html              ← HTML entry (SEO meta tags here)
├── tailwind.config.js      ← Custom color palette & theme
├── vite.config.js          ← Vite config + base path
├── postcss.config.js       ← PostCSS for Tailwind
└── package.json            ← Dependencies & scripts
```

---

## Dependencies Used

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | HashRouter for GitHub Pages |
| `framer-motion` | Scroll animations & transitions |
| `lucide-react` | Icon set |
| `tailwindcss` | Utility-first CSS |
| `vite` | Build tool |
| `gh-pages` | GitHub Pages deployment |
