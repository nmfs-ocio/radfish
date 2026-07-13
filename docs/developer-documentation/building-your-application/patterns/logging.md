---
sidebar_position: 10
title: "Logging"
description: Structured browser logging with streams, sinks, middleware, and optional IndexedDB persistence
---

# Logging

The RADFish logger is a small browser logging module you wire into your app once through the `Application` config. It gives you structured, leveled logging with named **streams**, configurable **sinks** (console plus optional IndexedDB persistence), and a **middleware** pipeline for enriching, redacting, or dropping records.

## Quick start

You don't need streams, sinks, or middleware to get going. The smallest useful setup is one stream that logs to the console.

**1. Declare a stream** in your `Application` config (typically `src/index.jsx`):

```js
import { Application } from "@nmfs-ocio/radfish";

const app = new Application({
  logger: {
    streams: {
      app: { level: "info" }, // your feature logs
    },
  },
});
```

**2. Log from anywhere** — the logger lives on the `Application`, so reach it with `useApplication().logger`:

```jsx
import { useApplication } from "@nmfs-ocio/react-radfish";

function SaveButton() {
  const logger = useApplication().logger;
  return (
    <button onClick={() => logger.stream("app").info("user clicked save", { id: 42 })}>
      Save
    </button>
  );
}
```

Click the button and open your browser's DevTools console — you'll see the record. That's the whole happy path. Persistence and middleware below are optional add-ons.

:::tip Why don't I see my log?

Each stream has a minimum **level**, and records below it are dropped. The `app` stream above is set to `info`, so `logger.stream("app").debug(...)` will **not** appear — `debug` is below `info`. Either log at `info` or higher, or lower the stream's level. This is the single most common "nothing is logging" surprise.

:::

## Overview

- The logger is configured **once** on the `Application` and is then available throughout your app via `app.logger` (in React, `useApplication().logger`).
- **Streams** are named log channels, each with a minimum level. Feature logs and noisy infrastructure logs can live in separate streams.
- **Sinks** are where records go: the console always, plus optional IndexedDB persistence so logs survive a page refresh.
- **Levels** are ordered `debug` < `info` < `warn` < `error`. A record whose level is below its stream's configured level is dropped.
- **Middleware** runs on every record and can enrich it, redact it, or drop it entirely.
- **"Never be silent":** if something goes wrong inside the logger that it can't otherwise handle, it falls back to `console.error` rather than swallowing the problem.

## Configuration

A fuller configuration adds a second (quieter) stream, IndexedDB persistence, and middleware. Everything beyond `streams` is optional.

```js
import { Application } from "@nmfs-ocio/radfish";
import { next, drop } from "@nmfs-ocio/radfish/logger";

const app = new Application({
  logger: {
    streams: {
      app: { level: "info" },     // your feature logs
      system: { level: "warn" },  // infrastructure logs (quieter)
    },
    // Optional: persist logs to IndexedDB so they survive a refresh.
    indexedDB: { dbName: "radfish-app-logs", maxSize: "5MB" },
    // Optional: transform, enrich, or drop records before they reach the sinks.
    middleware: [
      (record) => { record.attributes.sessionId = "demo-session"; return next(); },
      (record) =>
        /password|token|secret|ssn/i.test(`${record.message} ${JSON.stringify(record.attributes)}`)
          ? drop("redacted: contained sensitive data")
          : next(),
    ],
  },
});
```

### `streams`

Each key is a stream name and its value sets the minimum `level` for that stream. Above, `app` logs at `info` and higher, while `system` is quieter and only emits `warn` and `error`. Records below a stream's level are dropped before they reach any sink.

Reach a stream with `logger.stream(name)`, which returns a handle exposing `.debug(message, attributes)`, `.info(...)`, `.warn(...)`, and `.error(...)`. The first argument is the message string; the second is an optional attributes object.

### `indexedDB`

When provided, logs are persisted to IndexedDB so they survive a page refresh. IndexedDB is **on-disk origin storage** (not RAM), so `maxSize` keeps the persisted logs from growing without bound.

| Option | Type | Description |
| ------ | ---- | ----------- |
| `dbName` | `string` | The IndexedDB database name. |
| `maxSize` | `string` \| `number` | A storage budget for persisted logs. Default `"5MB"`. |

`maxSize` accepts either a **human-friendly string** like `"5MB"`, `"500KB"`, or `"1GB"`, or a **raw number of bytes**. Units are **binary** (`1KB` = 1024 bytes). When the store exceeds the budget, the **oldest records are evicted first** — the newest record is always kept. An invalid value (a non-positive number, or an unparseable string) throws immediately rather than silently disabling the budget.

:::note `maxSize` is an approximate content budget, not an exact disk cap

The budget is measured against the **serialized size of the log records**, not the actual bytes IndexedDB writes to disk. The real on-disk footprint is somewhat larger — IndexedDB adds its own encoding, keys, and index overhead — so a `"2MB"` budget may consume noticeably more than 2MB of actual storage. The budget is also applied **per object store**.

If you just want persisted logs to stay roughly bounded, set `maxSize` to the amount of log content you want to retain. If you need a **hard ceiling** on device storage, set it conservatively (budget for ~1.5–2× overhead) — e.g. use `"1MB"` if 2MB of real disk is your limit.

:::

### `middleware`

Each middleware receives a record and **must return** one of three signals:

| Return | Effect |
| ------ | ------ |
| `next()` | Continue down the pipeline, optionally with a modified record. |
| `drop(reason)` | Discard the record; `reason` documents why. |
| `forwardError(err)` | Divert the record into the error pipeline. |

Because the contract is return-based, "forgot to call `next()`" is impossible — a middleware that returns nothing is a programming error you'll catch immediately, not a silent black hole.

Middleware runs in order. In the example above, the first one enriches every record with a `sessionId`; the second drops anything that looks like sensitive data before it can reach a sink.

## Using the logger in components

Reach the logger from any component inside `<Application>` with `useApplication().logger`:

```jsx
import { useApplication } from "@nmfs-ocio/react-radfish";

function Checkout() {
  const logger = useApplication().logger;
  const app = logger.stream("app");

  const onPay = async () => {
    app.info("checkout started", { cartId });
    try {
      await pay();
      app.info("checkout succeeded", { cartId });
    } catch (err) {
      app.error("checkout failed", { cartId, error: err.message });
    }
  };

  return <button onClick={onPay}>Pay</button>;
}
```

`app.logger` is `null` if you haven't added a `logger` block to your `Application`, so make sure one is configured before calling `.stream()`.

### Reading persisted logs

When IndexedDB is configured, you can read logs back (for example to show recent activity, or to hydrate previous-session logs on startup):

```js
const logger = useApplication().logger;
const records = await logger.persistence.loadLogs(); // [{ timestamp, stream, level, message, attributes }, ...]
await logger.persistence.clearLogs();                // wipe the persisted logs
```

## PII and sensitive data

:::warning

Be deliberate about what you put in log attributes. Forms and requests often carry sensitive data — personally identifiable information (PII), credentials, tokens.

The redaction middleware shown above (dropping records matching `password|token|secret|ssn`) is a **backstop, not the primary defense**. The primary defense is simply never logging sensitive values in the first place: log identifiers, counts, and outcomes — not raw user input.

:::
