## Plan

Update the Pronghorn draw table Hunt code links so they pass a real PDF file URL to the external pdf.js viewer instead of the CPW/Widen HTML landing page.

## Why the current link is blank

The current code builds links like:

```text
https://mozilla.github.io/pdf.js/web/viewer.html?file=https://cpw.widen.net/s/t6tnqjg55q/postdrawrecapreport_prong-25_05222025_0816.pdf#page=...
```

That CPW/Widen URL returns `text/html`, not `application/pdf`, so pdf.js opens an empty viewer.

## Change

In `src/components/tables/AntelopeDrawTableNew.tsx`, replace the current `pdfUrl` value with CPW’s direct content URL:

```text
https://cpw.widen.net/content/jsyu9ob6ci/original/PostDrawRecapReport_PRONG-25_05222025_0816.pdf?u=qdpcdt
```

Then adjust the existing link template so it does not append another `.pdf`, while keeping the page anchor behavior:

```text
...viewer.html?file=${encodeURIComponent(pdfUrl)}#page=${pageNum}
```

## Scope

- Fix Pronghorn only.
- Keep Elk and Deer unchanged until you provide their current CPW direct URLs.
- No database/config refactor.