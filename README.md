# Juan Paolo Dente, Personal Site

A single-page static portfolio in a black-and-green Matrix theme. No build step, no frameworks, no dependencies. Just open
`index.html` in a browser to preview it locally.

```
site/
├── index.html              ← the whole site (hero, about, projects, experience, education, skills, contact)
├── assets/
│   ├── style.css           ← all styling (colours live at the top)
│   ├── main.js             ← matrix rain, scroll animations, typing effect
│   ├── juan.png            ← your profile photo (transparent cut-out)
│   ├── se-aware.jpg        ← SE Aware project screenshot
│   └── favicon.png         ← browser tab icon
└── README.md               ← this file
```

---

## Putting it online for free

### Option A: Netlify Drop (easiest, ~60 seconds)

1. Go to **https://app.netlify.com/drop**
2. Drag the whole `site` folder onto the page.
3. Done. You get a live URL like `random-name-123.netlify.app`.
4. Click **Site settings → Change site name** to make it something like `juanpaolodente.netlify.app`.

To update later, drag the folder again (or connect it to GitHub as in Option B).

### Option B: GitHub Pages (best if you want version history)

1. Create a free account at **https://github.com** if you don't have one.
2. Create a new repository named exactly:
   ```
   yourusername.github.io
   ```
   (replace `yourusername` with your actual GitHub username. This exact name is what makes
   it work as a personal site)
3. Make it **Public**, then click **uploading an existing file** on the repo page.
4. Drag in `index.html`, `README.md`, and the `assets` folder.
   > **Important:** drag the *contents* of the `site` folder, not the folder itself.
   > `index.html` must sit at the top level of the repo.
5. Click **Commit changes**.
6. Go to **Settings → Pages**. Under *Branch*, pick `main` / `/ (root)` and Save.
7. Wait 1 to 2 minutes. Your site is live at `https://yourusername.github.io`

---

## Editing your content

Everything is plain HTML. You can edit it in Notepad, VS Code, or directly on GitHub
by clicking the pencil icon on any file.

| What you want to change | Where |
|---|---|
| Your name, tagline, bio | `index.html`, the `<header class="hero">` block |
| Job history | `index.html`, the `#experience` section, copy a `<div class="tl-item">` |
| Projects | `index.html`, the `#projects` section, copy the whole `<article class="project">` |
| Project screenshot | replace `assets/se-aware.jpg` |
| Skills | `index.html`, the `<ul class="tags">` list |
| Profile photo | replace `assets/juan.png` (transparent PNG, square canvas) |
| Certifications + verify links | `index.html`, the `<ul class="cert-list">` in `#skills` |
| Email, LinkedIn, socials | `index.html`, the `#contact` section, **and** the footer |
| Colours | `assets/style.css`, the `:root` block at the very top |
| Matrix rain colour | `--matrix` in that same `:root` block |
| How long the rain trails are | `--matrix-fade`. Higher number = shorter tails |

---

## About the profile photo

The photo is a transparent PNG, so it floats on the page with no frame. Its shadow
traces your silhouette rather than a box, and on desktop it tilts and picks up a glow
when the cursor moves over it.

To use a **framed** photo instead (a rectangle with a background baked in):

1. Put your square `.jpg` in `assets/`
2. In `index.html`, change the `<img src>` to point at it
3. Add the `framed` class: `<div class="portrait framed">`

## Notes

- **One theme only.** The light mode and its toggle were removed. Everything is driven
  by the `:root` variables in `style.css`, so changing `--bg`, `--text` and `--accent`
  re-skins the whole site.
- **The matrix rain** is a canvas drawn in `main.js`. It runs at 24fps on desktop and
  15fps on phones, pauses when the tab is in the background, and is removed entirely
  for anyone with reduced motion enabled.
- **Custom domain:** both Netlify and GitHub Pages support them for free (you just pay for
  the domain itself, roughly 500 to 900 pesos a year). Netlify: *Domain settings → Add custom domain*.
  GitHub Pages: *Settings → Pages → Custom domain*.
- **Fonts** load from Google Fonts. If the site is opened with no internet, it falls back to
  system fonts and still looks fine.
