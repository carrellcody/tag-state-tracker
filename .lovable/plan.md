

## Remove "Start exploring today" Link from Home Page

In `src/pages/Home.tsx` (lines 51-55), remove the `<Link>` component for "Start exploring today" and adjust the surrounding text so it reads naturally. 

The sentence currently reads: `"...pronghorn. Start exploring today to find your next hunt! Head to the learn page..."`

After the change, it will read: `"...pronghorn. Head to the learn page to watch a video explaining all the features."`

This removes both the link and the "Start exploring today to find your next hunt!" sentence entirely, keeping the learn page link intact.

