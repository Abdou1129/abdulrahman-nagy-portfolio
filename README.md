# Abdulrahman Nagy — Portfolio

Personal portfolio for **Abdulrahman Nagy (عبدالرحمن ناجي)**: social media manager, content creator, TV presenter (Al Jazeera Mubasher “Know China”), videographer and voiceover artist.

**Live:** https://abdulrahman-nagy.abdou-ai.workers.dev

## Stack
Static HTML/CSS/vanilla JS, no build step. Bilingual EN/DE (`site/i18n.js`).

```
site/
  index.html      page + content
  styles.css      design system ("On Air" editorial dark theme)
  main.js         interactions: typewriter, filters, video modal, reveal
  i18n.js         German translations + rotating role titles
  assets/         images, posters, web-optimised videos
links.md          source list of work links
```

## Run locally
```
cd site && python3 -m http.server 8787
```

## Deploy (Cloudflare Workers static assets, config in `wrangler.jsonc`)
```
npx wrangler deploy
```

## To do (needs info from Nagy)
- Add a direct email / phone / LinkedIn to the contact section (currently Instagram DM + YouTube).
- Add campaign metrics (reach, follower growth, ROAS) to the social & ads cards.
- The Kuwait TV playlist video is private. Make it public to add it to the grid.
