# Fixing 404s for _next/static/chunks

If you see 404s for `main-app.js`, `app/not-found.js`, `app/global-error.js`, or similar:

## 1. Clean rebuild and hard refresh (most common fix)

```bash
# Remove build output and caches
rm -rf .next
npm run build
npm run start
```

Then in the browser:
- **Hard refresh**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or open the site in an **Incognito/Private** window

This ensures the HTML and chunk filenames (which include hashes) match.

## 2. Use the correct command for how you’re working

- **Development**: run `npm run dev` and open the URL it prints (e.g. http://localhost:3000). Don’t use a production build while developing.
- **Production locally**: run `npm run build` then `npm run start`, and open the URL from `next start` (e.g. http://localhost:3000).

## 3. If you see `?v=...` on chunk URLs

Next.js does **not** add `?v=...` to chunk URLs. If your request is for e.g. `main-app.js?v=1770894901544`:

- Disable **browser extensions** (ad blockers, privacy tools) and try again.
- If you use a **proxy or CDN**, make sure it isn’t rewriting or appending query params to `_next/static` URLs.

## 4. On Netlify

The project uses `publish = ".next"` with the Next.js plugin. Ensure:

- Build completes: `npm run test && npm run build`
- You’re not serving `.next` as plain static files; the Next.js runtime must serve the app so chunk names resolve correctly.

If 404s persist after a new deploy, trigger a **new deploy** and do a hard refresh or incognito visit to avoid cached HTML.
