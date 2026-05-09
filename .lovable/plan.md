## Fix Pronghorn Hunt code links

**Root cause:** CPW reuploaded the post-draw recap PDFs on Widen. The Widen slug (`t6tnqjg55q`) is unchanged, but the filename portion changed. Our hardcoded URL in `AntelopeDrawTableNew.tsx` still points at the old filename, so pdf.js loads but the PDF panel comes up blank.

- Old (in code): `.../t6tnqjg55q/postdrawrecapreport_pronghorn-25_05102025_1540.pdf`
- New (from CPW): `.../t6tnqjg55q/postdrawrecapreport_prong-25_05222025_0816.pdf`

## Change

In `src/components/tables/AntelopeDrawTableNew.tsx` (line ~565), update the `pdfUrl` constant to:

```
https://cpw.widen.net/s/t6tnqjg55q/postdrawrecapreport_prong-25_05222025_0816
```

The `.pdf` suffix and `#page=` anchor are appended in the existing `<a href>` template — no other code changes needed.

## Out of scope

- Elk and Deer draw tables almost certainly have the same stale-URL problem (both still use `_05102025_1540` filenames). You'll provide those URLs in a follow-up and we'll fix them then.
- No refactor to a config/DB-driven URL store — keeping it as a direct edit per your choice.
