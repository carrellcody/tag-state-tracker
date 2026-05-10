## Plan

Apply the same Pronghorn fix to the Elk draw table so Hunt code links open the actual PDF instead of the empty pdf.js viewer.

## Why the current link is blank

In `ElkDrawTableNew.tsx`:

```text
pdfUrl = "https://cpw.widen.net/s/qh6nqttnnz/postdrawrecapreport_elk-25_05172025_0612"
```

That CPW share URL returns `text/html` (a Widen landing page), so pdf.js opens an empty viewer. The actual downloadable PDF lives at CPW's direct content URL.

## Change

In `src/components/tables/ElkDrawTableNew.tsx`:

1. Line 958 — replace `pdfUrl` with the direct content URL:

```text
https://cpw.widen.net/content/v8vurwjjn6/original/PostDrawRecapReport_ELK-25_05172025_0612.pdf?u=qdpcdt
```

2. Line 1023 — drop the appended `.pdf` and wrap the URL in `encodeURIComponent` so the full query string survives the viewer's parser:

```text
https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}#page=${pageNum}
```

## Scope

- Elk only. Pronghorn already fixed; Deer unchanged until you provide its CPW direct URL.
- No DB/config changes.
