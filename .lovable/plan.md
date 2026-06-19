## Update OG social preview image

The new OG card has already been generated and uploaded to the CDN:
`/__l5e/assets-v1/6140d385-6610-475d-afae-e1237543d319/og-card-v2.png`

### Changes

1. **Save the `.asset.json` pointer** at `src/assets/og-card-v2.png.asset.json` so the asset is tracked in the project.
2. **Update `index.html`** — replace the two references to `https://tallotags.com/og-image.png` (lines 39 and 46) with the absolute CDN URL `https://tallotags.com/__l5e/assets-v1/6140d385-6610-475d-afae-e1237543d319/og-card-v2.png` for both `og:image` and `twitter:image`. Using a new filename (rather than overwriting `og-image.png`) forces Facebook/LinkedIn/Twitter to re-scrape instead of serving their cached copy.

### Note on cache

Even after publishing, Facebook may keep showing the old preview until it re-fetches. To force-refresh, paste the page URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and click "Scrape Again". LinkedIn has a similar [Post Inspector](https://www.linkedin.com/post-inspector/).

After this is merged, publish the site for the new tags to go live.
