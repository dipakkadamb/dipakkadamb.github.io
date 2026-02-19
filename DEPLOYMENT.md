# 🚀 Deploy to dipakkadamb.github.io

## Why This Setup is Different
There are two types of GitHub Pages:

| Type | Repo Name | URL | base path |
|---|---|---|---|
| **User Page** ✅ (yours) | `dipakkadamb.github.io` | `https://dipakkadamb.github.io` | `/` |
| Project Page | anything else | `https://dipakkadamb.github.io/repo-name` | `/repo-name/` |

You want the **User Page** — accessible everywhere at the root URL. This config is already set up correctly with `base: '/'`.

---

## Step-by-Step Deployment

### Step 1 — Create the GitHub Repository

1. Go to **https://github.com/new**
2. Repository name must be **exactly**: `dipakkadamb.github.io`
   - ⚠️ Must match your GitHub username perfectly
3. Set to **Public**
4. Do **NOT** tick "Add a README" — leave empty
5. Click **Create repository**

---

### Step 2 — Install Dependencies

Open terminal in the project folder:

```bash
npm install
```

---

### Step 3 — Test Locally First

```bash
npm run dev
```
Open `http://localhost:5173` and confirm everything looks correct.

---

### Step 4 — Initialize Git and Push Source Code

```bash
git init
git add .
git commit -m "Initial portfolio commit"
git branch -M main
git remote add origin https://github.com/dipakkadamb/dipakkadamb.github.io.git
git push -u origin main
```

---

### Step 5 — Deploy Built Site

```bash
npm run deploy
```

This command:
1. Runs `npm run build` → creates the optimized `dist/` folder
2. Pushes the `dist/` contents to a `gh-pages` branch automatically

---

### Step 6 — Configure GitHub Pages Source

1. Open your repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment → Source**, set:
   - **Branch:** `gh-pages`
   - **Folder:** `/ (root)`
4. Click **Save**

---

### Step 7 — Access Your Live Portfolio

Wait about 2 minutes, then visit:

```
https://dipakkadamb.github.io
```

Works on any device, browser, or network worldwide. ✅

---

## Updating the Portfolio Later

Whenever you make changes:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
npm run deploy
```

The live site refreshes within ~1 minute.

---

## Add Your CV PDF

1. Create a `public/` folder in the project root
2. Add your CV: `public/Dipak_Kadam_CV.pdf`
3. In `App.jsx`, find the Download CV button and update it to:

```jsx
<a
  href="/Dipak_Kadam_CV.pdf"
  download="Dipak_Kadam_CV.pdf"
  className="btn-secondary text-base px-8 py-3.5"
>
  Download CV
</a>
```

---

## Make the Contact Form Send Emails

**Formspree — Free, no backend needed:**

1. Go to https://formspree.io → Create free account → New Form
2. Copy your Form ID (e.g. `xkgwbpqz`)
3. In `App.jsx`, find `handleSubmit` and replace the body with:

```js
const handleSubmit = async (e) => {
  e.preventDefault()
  const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  if (res.ok) {
    setSent(true)
    setForm({ name: '', email: '', service: '', message: '' })
    setTimeout(() => setSent(false), 5000)
  }
}
```

Then run `npm run deploy` again. Submissions go to `dipak100kadam@gmail.com`.

---

## Common Issues and Fixes

| Problem | Fix |
|---|---|
| Page shows 404 on refresh | HashRouter is already set up — handled ✅ |
| Styles broken / white page | Confirm `base: '/'` in `vite.config.js` ✅ |
| Old version still showing | Wait 2 min, hard refresh: `Ctrl+Shift+R` |
| `npm run deploy` fails | Run `git push origin main` first, then retry |
| Site at wrong URL | Repo name must be exactly `dipakkadamb.github.io` |

---

## File Structure

```
dipakkadamb.github.io/
├── public/
│   └── Dipak_Kadam_CV.pdf    ← add your CV here
├── src/
│   ├── App.jsx               ← all components and content
│   ├── index.css             ← global styles + Tailwind
│   └── main.jsx              ← React + HashRouter entry
├── index.html                ← SEO meta tags
├── tailwind.config.js        ← custom Royal Blue theme
├── vite.config.js            ← base: '/'  ← critical!
├── postcss.config.js
└── package.json
```
