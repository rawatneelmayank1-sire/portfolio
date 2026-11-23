# portfolio

Personal site of Neelmayank Rawat: https://neelmayank-rawat.netlify.app

A plain static site (HTML, CSS, JavaScript modules). There is no build step: Netlify publishes this folder as it is.

## Pages
- `index.html`: home (hero, selected work, screens, about, contact)
- `work/<project>/index.html`: one case study per project
- `404.html`: not-found page

## Deploy on Netlify
1. Push this folder to `https://github.com/rawatneelmayank1-sire/portfolio`.
2. In Netlify: Add new site, Import from Git, pick the repository. Leave the build command empty; the publish
   directory is the repository root (also set in `netlify.toml`).
3. Or drag this folder onto the Netlify dashboard (Sites, Deploy manually).
4. If the site name differs from `neelmayank-rawat`, change `SITE_URL` in the `window.LINKS` block at the top of
   each page, and in `sitemap.xml` / `robots.txt`.

## Run locally
Any static server works, for example `python -m http.server 8000` in this folder, then open http://localhost:8000.
Opening the HTML file directly from disk does not work, because JavaScript modules need a server.

## Tech
three.js 0.170 (particle field), GSAP 3.15 with ScrollTrigger and SplitText, Lenis 1.1 smooth scroll, the Outfit
typeface from Google Fonts and Phosphor icons. All libraries load from pinned CDN versions. The page works without
WebGL (a static background stays) and honours reduced motion (still frames, no smooth scrolling), with a Pause motion
control for everything that moves on its own.

## License
MIT, see `LICENSE`.
