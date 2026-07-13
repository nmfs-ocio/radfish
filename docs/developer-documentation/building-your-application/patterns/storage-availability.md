---
sidebar_position: 11
title: "Storage availability"
description: Report how much storage is used/available and whether it's protected from eviction
---

# Storage availability

RADFish apps store their data and logs in the browser (IndexedDB). Two things about that storage matter at runtime: **how much is used/available**, and — more importantly for an offline-first app — **whether the browser might delete it**. This feature surfaces both, on the `Application` itself.

It lives entirely in the `radfish` **core** (on the `Application` instance). There is no storage-specific React hook or component — you reach the data through the app and render whatever UI you want.

## Configuration

**Storage availability needs no configuration.** `app.getStorageEstimate()` works out of the box: you always get the browser totals (`usageBytes` / `quotaBytes`) and persistence status, and a snapshot is taken automatically at init (available as `app.storageEstimate` by the time the app is `ready`).

The per-subsystem numbers simply reflect what your app already uses — you don't "enable" measurement:

- `logsBytes` is populated when you configure a `logger` with `indexedDB`.
- `stores` / `storesBytes` are populated for each data `stores` block you configure.

The only **optional** piece is a `storageManager` block, which sets the warning thresholds and whether to auto-request persistence:

```js
import { Application } from "@nmfs-ocio/radfish";

const app = new Application({
  storageManager: {
    persist: false,   // request persistent storage at startup (default false)
    warnAt: 0.8,      // browser-usage fraction at which `level` becomes "warning" (default 0.8)
    criticalAt: 0.9,  // ...and "critical" (default 0.9)
  },
});
```

Leave it out entirely and everything still works — `level` just uses the default `0.8` / `0.9` thresholds.

## Accessing the data (core API)

Everything hangs off the `Application`:

```js
app.storageEstimate                  // cached snapshot (lightweight at init — see note)
await app.getStorageEstimate()       // fresh snapshot incl. per-subsystem bytes; refreshes the cache
await app.requestPersistence()       // ask the browser to protect storage -> boolean
await app.getPersistenceStatus()     // 'persisted' | 'prompt' | 'never'
app.storageDatabases()               // names of the IndexedDB databases RADFish owns
app.on("storage:pressure", handler)  // fires when browser whole-origin usage crosses warnAt/criticalAt
app.off("storage:pressure", handler)
```

:::note The init snapshot is lightweight

The snapshot taken automatically at startup (`app.storageEstimate`) is **browser-only** — `logsBytes`, `stores`, `storesBytes`, and `radfishBytes` are `null`. Measuring per-subsystem bytes reads every record, so RADFish skips it at init to avoid delaying startup on a large persisted Store. Call **`await app.getStorageEstimate()`** to get those numbers (that's what populates them). If you ever want a browser-only read on purpose, pass `getStorageEstimate({ measureSubsystems: false })`.

:::

Reading the per-subsystem numbers is a one-liner — no hook or extra setup:

```js
const s = await app.getStorageEstimate();
console.log(s.storesBytes, s.logsBytes, s.radfishBytes, s.usageBytes);
//          catch Store    logger       RADFish total  browser whole-origin
```

### The snapshot

| Field | Meaning |
| ----- | ------- |
| `supported` | Whether `navigator.storage.estimate()` exists here (false on older Safari, in-app webviews, non-secure contexts). |
| `usageBytes` / `quotaBytes` | Origin-wide bytes used / available. |
| `remainingBytes` | `quotaBytes - usageBytes`. |
| `percentUsed` | `0..1`, or `null` if unknown. |
| `level` | `'ok'` \| `'warning'` \| `'critical'` — your thresholds applied to the **browser whole-origin** `percentUsed` (not `radfishBytes`). |
| `persisted` | Whether storage is protected from eviction (see below). |
| `logsBytes` | Bytes used by the **logger**. |
| `stores` | Per **data Store** bytes, keyed by database name, e.g. `{ "radfish-catch-data": 12345 }`. |
| `storesBytes` | Total bytes across all data Stores. |
| `radfishBytes` | `logsBytes + storesBytes` — total storage RADFish manages (logger + Stores). |
| `usageDetails` | Chromium-only per-system breakdown (`indexedDB`, `caches`, …); `null` elsewhere. |
| `databases` | Names of the IndexedDB databases RADFish owns. |

The **per-subsystem numbers** (`logsBytes`, `stores`/`storesBytes`, `radfishBytes`) are measured by RADFish itself — it reads each database and sums the serialized size of the records — because the browser provides no per-database byte breakdown cross-browser (only Chromium's `usageDetails`, and only lumped by storage *system*, not per database). This means they work on **every** browser, but the Store measurement reads all records on demand, so treat it as an occasional call, not a tight-loop one.

`usageBytes` (origin-wide, from the browser) vs `radfishBytes` (logger + Stores, measured by RADFish) are two different totals: the former includes everything the origin stores (caches, service workers, other libraries); the latter is only RADFish-managed data.

:::note What `level` / `storage:pressure` watch

The `warnAt` / `criticalAt` thresholds (and the `level` field and `storage:pressure` event) are compared against the **browser whole-origin** usage — `percentUsed = usageBytes / quotaBytes` — because the browser quota is the real ceiling that causes `QuotaExceededError` and eviction. They are **not** tied to `radfishBytes`, `storesBytes`, or `logsBytes`; those are informational numbers with no threshold attached.

One consequence: the browser quota is usually huge (often ~10 GB+), so for text-based data these thresholds rarely trip. If you want a warning tied to *your app's own* usage (e.g. "warn when catch data passes 40 MB"), that's an app-level budget you'd check yourself against `storesBytes` / `radfishBytes` — RADFish doesn't impose one.

Note that `logsBytes` is **self-bounded** by the logger's `maxSize` (the logger evicts its own oldest records), so it can't grow without limit. **`storesBytes`** (your data Store) has **no cap** — that's the number to watch for growth.

:::

## Reading it in a React component

Storage lives on the `Application`, which any component reaches with **`useApplication()`**. Read the snapshot and subscribe to the `storage:pressure` event:

```jsx
import { useState, useEffect } from "react";
import { useApplication } from "@nmfs-ocio/react-radfish";

function StorageMeter() {
  const app = useApplication();
  const [estimate, setEstimate] = useState(app.storageEstimate);

  useEffect(() => {
    app.getStorageEstimate().then(setEstimate);        // refresh on mount
    const onPressure = (e) => setEstimate(e.detail);   // update when it fills up
    app.on("storage:pressure", onPressure);
    return () => app.off("storage:pressure", onPressure);
  }, [app]);

  if (!estimate?.supported) return <p>Storage info unavailable on this browser.</p>;
  return (
    <p>
      {Math.round(estimate.percentUsed * 100)}% used —{" "}
      {estimate.persisted ? "protected" : "not protected"}
    </p>
  );
}
```

There is no browser "storage pressure" push event, so the snapshot updates on mount and on `storage:pressure`. If you need live updates while nothing crosses a threshold, re-read `app.getStorageEstimate()` on an interval.

## Requesting persistent storage

```js
const granted = await app.requestPersistence();   // asks the browser; returns true/false
const status = await app.getPersistenceStatus();   // 'persisted' | 'prompt' | 'never'
```

`requestPersistence()` is best called **from a user gesture** (a button click). `getPersistenceStatus()` is a tri-state you can branch on: already `'persisted'` → do nothing; `'prompt'` → show a button to request it; `'never'` → the browser can't grant it, nudge "Add to Home Screen".

You cannot *force* a grant — the boolean is the browser's decision, not RADFish's. Setting `storageManager.persist: true` only *asks* at startup; whether it's granted is up to the browser.

## Understanding persistence and eviction

This is the part that matters most for offline-first apps.

### Best-effort vs. persistent

By default, browser storage is **best-effort** — the browser may **delete your whole origin's data on its own** to reclaim space or clean up. **Persistent** storage (granted via `requestPersistence()`) tells the browser *not* to auto-delete it.

- **Best-effort** = a cache the browser may clear.
- **Persistent** = data that sticks around until the *user* clears it (clears site data, uninstalls, wipes the device).

### Two different kinds of "running out"

Persistence protects against one of these, not the other:

1. **The device runs low on disk** → the browser evicts sites to free space. **Persistence protects against this.**
2. **Your app fills its own quota** → writes fail with `QuotaExceededError`. **Persistence does *not* help here** — it stops *deletion*, it doesn't give you more room. Handle it by syncing/pruning.

So **persistence ≠ unlimited storage**, and **persistence ≠ immune from the user clearing data**.

### Browsers behave differently

All three engines implement `navigator.storage.persist()`, but they respond differently, and their eviction policies differ:

| Browser | How `persist()` is granted | Auto-deletes non-persistent data when… |
| ------- | -------------------------- | -------------------------------------- |
| **Firefox** | Shows a **permission prompt** | Device runs low on disk |
| **Chrome** | **Silent heuristic** — installed PWA / notifications / engagement | Device runs low on disk (no inactivity rule) |
| **Safari** | **Silent heuristic** — installed / engagement | Low disk **and** ~7 days of no visits (see below) |

A `false` from `requestPersistence()` is **not a failure** — it's the browser honestly declining. Surface it (via `persisted`) so your app can react, rather than assuming success.

### Safari's 7-day wipe (the big one for offline apps)

WebKit deletes **all** of a site's script-writable storage (IndexedDB, Cache, LocalStorage, service workers) after **seven days of Safari use without user interaction on the site**:

> "deleting all of a website's script-writable storage after seven days of Safari use without user interaction on the site" — [WebKit Blog](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)

**Adding the app to the Home Screen exempts it.** Installed web apps have their own use-counter and are not subject to the 7-day deletion:

> "Web applications added to the home screen are not part of Safari and thus have their own counter of days of use. Their days of use will match actual use of the web application which resets the timer." — [WebKit Blog](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)

For an offline field app used intermittently, this means unsynced data in a **Safari tab can vanish in a week** — so **nudge users to Add to Home Screen** (which also gets `persist()` granted on Chrome/Safari), and always keep a server sync backstop.

### Always keep a server backstop

Even persistent storage isn't an absolute guarantee. Treat local storage as a **cache, not the system of record** — sync field data to a server so nothing important lives only on the device. Use `persisted` and `storage:pressure` to nudge users (install, sync), not as permission to skip syncing.

## Caveats

- **The numbers are approximate.** `quota` is derived from total disk, padded for privacy, and drifts. Treat the estimate as an advisory gauge, not an exact budget — and still handle `QuotaExceededError` on writes.
- **The browser gives no per-database split** — it reports one origin-wide total. RADFish fills that gap by measuring the logger and each Store *itself* (`logsBytes`, `storesBytes`), so you do get the per-subsystem breakdown; it just comes from RADFish reading the records, not from the browser. The Store measurement reads all records on demand (O(n)), so call it when you need a number, not in a tight loop.
- **Unsupported browsers degrade gracefully.** When `supported` is `false`, the estimate is unavailable but persistence status may still be readable, and the app keeps working.

## Sources

- [MDN — StorageManager (`estimate` / `persist` / `persisted`)](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager)
- [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [web.dev — Persistent storage](https://web.dev/articles/persistent-storage)
- [WebKit — Full Third-Party Cookie Blocking and More (7-day cap)](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [WebKit — Updates to Storage Policy (Safari 17)](https://webkit.org/blog/14403/updates-to-storage-policy/)
