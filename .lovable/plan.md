

## Problem Analysis

The root cause is in the `useIsMobile` hook (`src/hooks/use-mobile.tsx`). It initializes `isMobile` as `undefined`, which becomes `false` via `!!undefined`. The actual value is only set inside a `useEffect` (which runs after the first render). This means:

1. On first render, `isMobile` is `false`
2. Both the filter panel AND the data table render simultaneously (since the conditional `(!isMobile || showMobileFilters)` and `(!isMobile || !showMobileFilters)` both evaluate to `true` when `isMobile` is `false`)
3. The "Apply filters" button is hidden (it only shows when `isMobile` is `true`)
4. After the effect runs, `isMobile` corrects to `true` and the layout fixes itself

In the Lovable preview, this correction happens fast enough to be invisible. On an actual phone (especially Android Chrome), the initial render can persist longer, or React may not re-render quickly due to the heavier draw table components loading CSV data. The OTC/Harvest tables are lighter and may re-render before the user notices.

## Fix

**File: `src/hooks/use-mobile.tsx`**

Change the initial state from `undefined` to a synchronous check of `window.innerWidth`. This ensures `isMobile` is correct from the very first render:

```typescript
const [isMobile, setIsMobile] = React.useState<boolean>(
  () => typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
);
```

And return `isMobile` directly instead of `!!isMobile` (since it's now a boolean, not `boolean | undefined`).

This is a one-file fix that resolves the issue for all tables (draw, harvest, and OTC) simultaneously.

