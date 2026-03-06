
Goal: make mobile filter workflow on draw pages behave correctly on real Android Chrome even when JS mobile detection is unreliable on the custom domain.

What I found:
- The draw tables still gate the mobile workflow with `isMobile` for:
  - whether filter panel vs table panel is shown
  - whether the “Apply filters and view data” / “Filters” buttons render
- Your symptom (“stats under filters” + missing Apply button) matches `isMobile === false` on phone.
- Since preview works but custom domain fails, we should make draw-page panel visibility CSS-driven (media query) instead of JS-device-detection-driven.

Implementation plan:

1) Update draw-table panel visibility to CSS-first (robust on real devices)
- Files:
  - `src/components/tables/AntelopeDrawTable.tsx`
  - `src/components/tables/DeerDrawTable.tsx`
  - `src/components/tables/ElkDrawTable.tsx`
- Replace conditions:
  - From: `(!isMobile || showMobileFilters)` and `(!isMobile || !showMobileFilters)`
  - To: always render both containers but control visibility by responsive classes + `showMobileFilters`:
    - Filters panel: visible on desktop always; on mobile only when `showMobileFilters` is true
    - Data panel: visible on desktop always; on mobile only when `showMobileFilters` is false
- This removes dependency on `useIsMobile()` for the core mobile workflow while preserving desktop layout.

2) Make mobile action buttons strictly CSS-responsive
- In the same 3 draw files:
  - Render “Apply filters and view data” buttons with `md:hidden` (not `{isMobile && ...}`)
  - Render “Filters” button at top of data panel with `md:hidden`
- Keep button handlers identical:
  - Apply: `setShowMobileFilters(false)`
  - Filters: `setShowMobileFilters(true)`

3) Keep existing `useIsMobile` for non-workflow behavior only
- Do not change `src/hooks/use-mobile.tsx` further in this iteration.
- Continue using `isMobile` where it affects minor behavior (e.g., link behavior inside rows), but not for panel-switching visibility.

4) Verify consistency with harvest/OTC UX
- Confirm draw pages now mirror expected interaction sequence:
  - Mobile default: filters shown + apply button visible
  - Tap apply: filter panel hides, data panel shows with “Filters” button
  - Tap filters: return to filter panel

5) Validation checklist
- Test in preview at mobile width on:
  - `/antelope`
  - `/deer` (with access)
  - `/elk` (with access)
- Test desktop width to confirm side-by-side experience remains unchanged.
- Publish and re-test on custom domain routes directly.
- If custom-domain edge cache lags, append a cache-buster once when testing (e.g. `?v=mobilefix1`) to confirm newest bundle is loaded.

Technical details:
- Reason for this approach: CSS media queries (`md:hidden`, `md:block`) are more reliable across mobile browsers than runtime width detection for first render and domain-specific delivery quirks.
- Scope is intentionally limited to draw pages because that’s where regression appears, minimizing risk to harvest/OTC pages that already behave correctly for you.

Expected outcome:
- On real Android Chrome, draw pages will always show the mobile “Apply filters and view data” workflow correctly, matching the harvest/OTC interaction pattern.
