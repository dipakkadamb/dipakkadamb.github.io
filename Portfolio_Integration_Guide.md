# Adding the "Support" link to your main portfolio

To integrate this new documentation portal into your main website (`dipakkadamb.github.io`), you need to add a "Support" (or "Docs") link to its navigation menu.

Assuming your main portfolio is a standard HTML/CSS or React project, you'll need to modify its `header` or `nav` section.

## Instructions
1. Open the source code repository for your main portfolio (`dipakkadamb.github.io`).
2. Locate your navigation component (e.g., `index.html`, `Navbar.js`, or similar).
3. Add a new link pointing to the URL where we are hosting this Docusaurus site (`/it-docs/`).

### Example (HTML):
```html
<nav class="navbar">
    <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/#about">About</a></li>
        <li><a href="/#portfolio">Portfolio</a></li>
        <!-- Add the link below -->
        <li><a href="/it-docs/" target="_blank">Support / Docs 📚</a></li>
    </ul>
</nav>
```

### Example (React / Next.js):
```jsx
<ul className="nav-links">
  <li><Link href="/">Home</Link></li>
  <li><Link href="#portfolio">Portfolio</Link></li>
  {/* Add the link below */}
  <li>
    <a href="/it-docs/" target="_blank" rel="noopener noreferrer">
      Support / Docs 📚
    </a>
  </li>
</ul>
```

Once you deploy that simple HTML change to your main `dipakkadamb.github.io` repository, visitors will be able to easily click "Support" and jump right into this new technical knowledge base!
