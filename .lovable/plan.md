

## Plan: Install Meta Pixel

Add the Meta Pixel script to `index.html` inside the `<head>` tag, below the existing Google Analytics code.

### Change

**File: `index.html`**

Insert the Meta Pixel code after the Google Analytics `gtag('config', ...)` script block (around line 8), before the `<meta charset>` tag. This includes the `<noscript>` fallback image tag, which will be placed just inside `<body>` (since `<noscript>` with an `<img>` belongs in the body). 

Actually, since the standard Meta instructions say to put everything in `<head>`, and browsers handle `<noscript>` in `<head>` fine for tracking pixels, I'll place the entire block in `<head>` after the Google Analytics script, keeping it simple and matching Meta's instructions exactly.

Single file edit, no other changes needed — the pixel fires on every page load automatically since `index.html` is the SPA shell.

