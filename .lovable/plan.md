

## Fix: Update Meta Pixel ID

The Meta Pixel installed in `index.html` has an outdated Pixel ID. The current code references `1979175766285961`, but your Meta account now uses `25723028904036025`.

### Changes to `index.html`

1. Update the `fbq('init', ...)` call from `'1979175766285961'` to `'25723028904036025'`
2. Update the `<noscript>` fallback image URL query parameter from `id=1979175766285961` to `id=25723028904036025`

Both changes are in `index.html` — no other files affected. After this, publish/update the site and test again in Meta Events Manager.

