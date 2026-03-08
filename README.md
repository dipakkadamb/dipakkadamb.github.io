# TechDocs — Knowledge Base Portal

A fully self-contained documentation portal that runs on GitHub Pages with **zero build steps**.

## 🚀 Deploy to GitHub Pages in 3 Steps

1. **Create a new GitHub repository** (e.g. `my-docs`)
2. **Upload `index.html`** to the root of the repo
3. **Enable GitHub Pages**: Settings → Pages → Source: `main` branch → `/ (root)` → Save

Your site will be live at: `https://yourusername.github.io/my-docs/`

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 Home | Hero, search, stats, featured articles, categories, latest articles |
| ✏️ Write | Rich text editor (bold, italic, headings, lists, code, colors), auto-save, preview |
| 📄 Articles | Grid/list view, filter by category/tag/search, sort options |
| 📖 Article View | Table of contents, related articles, comments/feedback, bookmarks |
| 🗂️ Categories | Visual category browser with article counts |
| ⚙️ Settings | Branding, category manager, analytics dashboard, draft management |
| ℹ️ About | Company info and portal description |
| 🌙 Dark Mode | Full dark/light mode toggle |
| 🔑 Admin Login | Password: `admin` (gates write & settings) |
| 💾 Persistence | All data saved to localStorage |

## 🔑 Admin Access

Click **Admin** in the navbar and enter password: **`admin`**

Once logged in you can:
- Write and edit articles
- Publish / unpublish articles
- Manage categories
- Access settings and dashboard

## 📁 File Structure

```
my-docs/
└── index.html   ← Everything is in this one file
```

## 🛠 Customization

All data is stored in the browser's `localStorage`. To set default content,
edit the `DEFAULT_SETTINGS`, `DEFAULT_CATEGORIES`, and `SAMPLE_ARTICLES`
constants at the top of the `<script>` block in `index.html`.

## 📖 URL Structure (Hash Routing)

```
/              → Home
/#articles     → All Articles
/#categories   → Categories
/#about        → About
/#article/ID   → Single Article
/#write        → Write (admin only)
/#settings     → Settings (admin only)
```

## 🔒 Changing the Admin Password

In `index.html`, search for `doLogin()` and change the password check:

```js
if(pw==='admin'||pw==='admin123'||pw==='password'){
```

Replace with your desired password(s).
