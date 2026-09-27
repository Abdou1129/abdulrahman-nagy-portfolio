# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, bilingual (EN/DE) portfolio site for **Abdulrahman Nagy** (عبدالرحمن ناجي), a social media manager, content creator, TV presenter (Al Jazeera Mubasher "Know China"), videographer and voiceover artist. The audience is recruiters hiring for social media, content and marketing roles. Plain HTML/CSS/vanilla JS with no build step, no dependencies and no tests.

- Live: https://nagy-media.de (Cloudflare Workers static assets, worker `abdulrahman-nagy`). Custom domains `nagy-media.de` and `www.nagy-media.de` are declared under `routes` in `wrangler.jsonc`. Declaring routes disables the `workers.dev` URL, which is intended.
- Domain: registered at GoDaddy, with nameservers delegated to Cloudflare (zone `nagy-media.de`). The Cloudflare zone also holds a redirect rule sending `www` → apex with a 301, and has "Always Use HTTPS" turned on. DNS records for the custom domains are managed by Workers, so don't add them by hand.
- Repo: https://github.com/Abdou1129/abdulrahman-nagy-portfolio (`main`)

## Commands

```bash
cd site && python3 -m http.server 8787   # local preview at http://localhost:8787
npx wrangler deploy                      # deploy; wrangler.jsonc serves ./site as static assets
git push                                 # GitHub (gh is authenticated as Abdou1129)
```

`wrangler pages …` commands now delegate to Workers. Use `wrangler deploy`, not `wrangler pages deploy`. `site/_headers` sets caching: assets get `max-age=86400`. Filenames are not content-hashed, so don't make the cache `immutable`.

## Architecture

All content lives in `site/index.html`. Three scripts cooperate through globals:

- **`i18n.js`** (loaded first, not deferred) defines `window.I18N_DE` (German strings), plus `window.ROLES_EN` and `window.ROLES_DE` (the hero typewriter words).
- **`main.js`** (deferred) contains all behaviour: language switch, typewriter, reveal-on-scroll, count-up stats, work filters, the video modal, and the inline film sound toggles.

### Translation

- English is the source text and lives in the HTML.
- Any translatable element gets `data-i18n="key"`. On load, `main.js` caches each element's English `innerHTML`, then swaps in `I18N_DE[key]` when German is selected.
- A key missing from `I18N_DE` silently falls back to English. When you add or change text, add the German value too.
- Values are HTML strings, so escape `&` as `&amp;`, and keep inner markup such as `<span class="serif accent">` identical in both languages.
- The language choice is stored in `localStorage` under `lang` (wrapped in try/catch). The default follows `navigator.language`.

To check for missing translations in the browser console:
```js
[...document.querySelectorAll('[data-i18n]')].filter(e => !(e.dataset.i18n in I18N_DE)).map(e => e.dataset.i18n)
```

### Work cards and the video modal

Each work item in `.work-grid` is an `<article class="card">`:

- **Filters:** `data-cat` is a space-separated list matched against the filter buttons' `data-filter` values: `tv`, `video`, `social`, `news`.
- **Playback:** a full-card `<a class="open">` carries two things:
  - `href`: the real URL, used for middle-click or a new tab.
  - `data-embed`: the iframe `src` that the modal opens.
- **Embed URL formats:**
  - YouTube video: `https://www.youtube-nocookie.com/embed/<id>?autoplay=1`
  - YouTube playlist: `/embed/videoseries?list=<id>&autoplay=1`
  - Google Drive: `https://drive.google.com/file/d/<id>/preview`
  - Instagram: `https://www.instagram.com/p/<code>/embed/`, plus `data-vertical="1"` so the modal switches to a 9:16 frame.
- **Voiceover cards:** the `.vo` cards in `#voice` use the same `data-embed` / `data-vertical` mechanism.
- **Layout:** the grid is 3 columns and `.card.wide` spans 2. Keep the total slot count a multiple of 3 so the last row isn't left with an orphan card.

### Media

- **Thumbnails:** stored locally in `site/assets/img/`, never hotlinked.
  - Naming: `yt-<videoId>.jpg` and `drv-<name>.jpg`.
  - Drive thumbnails come from `https://drive.google.com/thumbnail?id=<id>&sz=w1280`.
  - Instagram CDN image URLs are signed and expire, so Instagram cards use a CSS gradient placeholder (`.ph`) instead.
- **Size:** keep images at 960px wide or less.
- **Raw footage:** `videos/` holds the original WhatsApp exports. It's gitignored (about 55MB) and exists only on the original machine. Web copies live in `site/assets/video/`:
  - `reel-1.mp4` and `reel-2.mp4`: H.264 with `+faststart`, about 6MB each, with `.jpg` posters.
  - `hero-loop.mp4`: a muted montage of faceless B-roll (calligraphy, food, wide room shots) cut from both raw videos.
- **Who is on screen:** Nagy does **not** appear in the `videos/` footage. The people on screen are interviewees at Abubakr Moschee Köln's Open Mosque Day. Never use their frames as his portrait, and keep faces out of the hero loop.
  - His real photos are `nagy-portrait*.jpg`, cropped from thumbnails of his own YouTube videos (`yt-Dw2RrQ2JBWM.jpg`, `yt-9haGX3s8gOM.jpg`).
  - `og.jpg` (1200×630) is rendered with ffmpeg `drawtext`.
- **Shell:** the shell is zsh. Write `${VAR}` before a colon inside ffmpeg filter strings, because zsh treats `$VAR:t` as a modifier.

## Content rules

- **Sources:** facts come from `links.md` (Nagy's own list of work links) and from research on those links. Don't invent metrics, employers, dates, education or contact details.
- **Contact:** no email, phone or LinkedIn is known yet. Contact goes through Instagram DM (`ig.me/m/nagy_98`) and YouTube. Pending items are listed in the README's "To do".
- **Name:** use "Abdulrahman Nagy" as the primary spelling. His YouTube credits use "Abdelrahman Nagi", which is kept in the JSON-LD `alternateName`.
- **Absolute URLs:** `index.html` hardcodes the live URL in the canonical link, the `og:*` tags and the JSON-LD block. Update all of them if the domain changes.
- **Reduced motion:** honoured in both CSS (`prefers-reduced-motion`) and `main.js`, which skips the typewriter animation, count-up and video autoplay. Keep that when adding motion.
