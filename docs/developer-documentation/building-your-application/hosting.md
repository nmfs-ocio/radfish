---
sidebar_position: 9
title: Hosting Your Application
description: Build a RADFish app for production and host it on a static web server
---

This guide explains how to build your RADFish application for production and host it so that it works offline. A RADFish app builds to plain static files (HTML, CSS, and JavaScript), so it can be hosted on any static web server or storage bucket. There is no app server to run.

## Building for Production

Build the app:

```bash
npm run build
```

This writes the production build to the `dist/` directory. Upload the contents of `dist/` to your host.

### Hosting under a subpath

If your app is served from a subpath (e.g. `https://example.noaa.gov/my-app/` instead of the domain root), set Vite's `base` option in `vite.config.js`:

```javascript
export default defineConfig({
  base: "/my-app/",
  // ...
});
```

Keep the base path in **one** place. Everything else should read it from `import.meta.env.BASE_URL`, which Vite sets from `base`. That includes the service worker, the router, and any code that builds URLs by hand.

To use a different base path per environment, read it from an environment variable with Vite's `loadEnv`. Inside `vite.config.js`, `process.env` does not include values from `.env` files, but `loadEnv` reads both `.env` files and the real environment:

```javascript
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_APP_BASE_PATH || "/",
    // ...
  };
});
```

:::warning Older projects

Projects created from older RADFish templates, and the RADFish examples, hard-code paths that break under a subpath. Make these three changes:

1. In `src/service-worker.js`, replace:

   ```javascript
   createHandlerBoundToURL(import.meta.env.VITE_PUBLIC_URL + "/index.html");
   ```

   with:

   ```javascript
   const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, "/");
   // ...
   createHandlerBoundToURL(`${baseUrl}index.html`);
   ```

   If `VITE_PUBLIC_URL` is missing or doesn't match `base`, the old line stops the service worker from starting, and the app has no offline support.

2. In `src/index.jsx`, register the service worker from the base path instead of `/service-worker.js`:

   ```javascript
   const baseUrl = import.meta.env.BASE_URL.replace(/\/?$/, "/");
   const app = new Application({
     serviceWorker: { url: `${baseUrl}service-worker.js` },
   });
   ```

3. In `src/App.jsx`, pass the base path to the router:

   ```jsx
   <BrowserRouter basename={import.meta.env.BASE_URL}>
   ```

:::

For subpath hosting, use `@nmfs-ocio/radfish` 1.2.1 or later. Earlier versions always register the service worker with scope `/`, which the browser rejects when the worker is served from a subpath (unless the server sends a `Service-Worker-Allowed: /` header).

### Environment variables

Every `VITE_*` variable your code reads is replaced with its value in the built JavaScript at build time. This means:

- **They are public.** Anyone can read them in the browser. Never put secrets in a `VITE_*` variable.
- **They are fixed per build.** To deploy to several environments (e.g. dev, test, and production), build once per environment with that environment's values.
- **Your CI system must set them.** Production values are usually not committed (the template has no `.env.production`), so set them in your CI system, such as GitHub Environments.

Installing `@nmfs-ocio` packages in CI also requires a GitHub token with the `read:packages` scope. See [Getting Started](../getting-started.mdx) for details.

## Server Requirements

Your host must meet these requirements for the app to load and work offline:

| Requirement | Why |
| --- | --- |
| Serve the app over **HTTPS** | Browsers only run service workers on HTTPS (or `localhost`). Without HTTPS, the app has no offline support. |
| Serve `index.html` with status 200 for **app routes** (paths whose last segment has no file extension, e.g. `/my-app/trips/123`) | Opening or refreshing a link then loads the app instead of a 404. Once the service worker is active it handles these itself, so this matters most on the first visit. |
| Return a **404 for missing files** (paths whose last segment has a file extension, e.g. `.js` or `.png`) | A broken file path then shows up as an error instead of silently returning `index.html`. |
| Send `Cache-Control: no-cache` for `index.html` and `service-worker.js` | Users then pick up new releases. Browsers already skip their own cache when checking for a new service worker, but a CDN or proxy in front of your host may not. A cached `index.html` can point to files that no longer exist. |
| Serve the manifest (`manifest.json` in the template) with `Content-Type: application/manifest+json` | This is the type the web app manifest spec recommends. Any JSON type works, but some hosts send unfamiliar file types with the wrong type. |

Files with a content hash in their name, such as Vite's output in `assets/` (e.g. `assets/index-BVNes4u9.js`), never change, so they can be cached for a long time (e.g. `Cache-Control: public, max-age=31536000, immutable`). Files copied from `public/`, such as icons and the manifest, have no hash and should not be cached long-term.

:::info
After a new release is downloaded, the new service worker may wait until every open tab of the app is closed before it takes over.
:::

## Verifying a Deployment

After each deploy, check the app in Chrome:

1. Open the app and let it load once.
2. Open DevTools and go to **Application** > **Service workers**. The status should read **activated and is running**, or **activated and is stopped**, which is normal for an idle worker.
3. In the DevTools **Console**, run `navigator.serviceWorker.controller`. It should print a `ServiceWorker` object, not `null`. If it prints `null`, reload the page once with a normal reload (not a hard reload) and check again.
4. In DevTools, go to **Network** and set throttling to **Offline**.
5. Reload the page with a normal reload (`Cmd+R` on Mac, `Ctrl+R` on Windows). The app should load.
6. Go back online and open a deep link (e.g. `/my-app/some/page`) directly. The app should load.

## Example: Deploying with GitHub Actions

This example builds the app and deploys it to a Google Cloud Storage bucket. One job builds the app, and a second job, the only one allowed to sign in to Google Cloud, copies the build to the bucket. The example assumes the path in the bucket matches the URL path.

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: "GitHub Environment to deploy to"
        required: true
        type: choice
        options: [dev, test]

concurrency:
  group: deploy-${{ inputs.environment }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
      deployment: false
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          registry-url: https://npm.pkg.github.com
          scope: "@nmfs-ocio"

      - run: npm ci
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GH_PACKAGES_TOKEN }}

      # Add a test step once your app has tests. The template's `npm test` is a placeholder that fails.
      # - run: npx vitest run

      - run: npm run build
        env:
          # Only takes effect if vite.config.js reads it (see "Hosting under a subpath").
          VITE_APP_BASE_PATH: /${{ vars.APP_PATH }}/
          # ...plus every other VITE_* value the app needs

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: ./dist
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    permissions:
      contents: read
      id-token: write # lets this job sign in to Google Cloud without a stored key
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: ./dist

      - uses: google-github-actions/auth@v2
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Upload and set headers
        env:
          DEST: gs://${{ secrets.GCS_BUCKET_NAME }}/${{ vars.APP_PATH }}
        run: |
          gcloud storage rsync --recursive ./dist "$DEST"
          gcloud storage objects update "$DEST/index.html" --cache-control="no-cache"
          gcloud storage objects update "$DEST/service-worker.js" --cache-control="no-cache"
          # Use the manifest file your index.html links to (manifest.json in the template).
          gcloud storage objects update "$DEST/manifest.json" --content-type="application/manifest+json"
```

A storage bucket on its own can't serve HTTPS on a custom domain or return `index.html` with status 200 for app routes. A service in front of the bucket, such as a Google Cloud HTTPS load balancer, must handle both. See [Google Cloud: Host a static website](https://cloud.google.com/storage/docs/hosting-static-website).

## Troubleshooting

### Offline refresh shows the browser's "No internet" page?

No service worker is controlling the page. Follow the steps in [Verifying a Deployment](#verifying-a-deployment).

### Console shows `ServiceWorker script evaluation failed`?

The service worker's `index.html` path doesn't match the build's base path. Use `import.meta.env.BASE_URL` in `src/service-worker.js`. See [Hosting under a subpath](#hosting-under-a-subpath).

### `service-worker.js` returns a 404 or an HTML page?

`src/index.jsx` registers `/service-worker.js` from the domain root. Register `${baseUrl}service-worker.js` instead. See [Hosting under a subpath](#hosting-under-a-subpath).

### Console shows `The path of the provided scope ('/') is not under the max scope allowed`?

Your app uses a version of `@nmfs-ocio/radfish` older than 1.2.1 and is hosted under a subpath. Upgrade `@nmfs-ocio/radfish`.

### `navigator.serviceWorker.controller` is `null` after a reload?

- Use a normal reload. A hard reload (`Cmd+Shift+R` or `Ctrl+Shift+R`) skips the service worker.
- In DevTools, go to **Application** > **Service workers** and turn off **Bypass for network**.

### Refreshing a page like `/my-app/trips/123` returns a 404?

Your host doesn't send app routes to `index.html`. See [Server Requirements](#server-requirements).

### Fonts or images point to the wrong path after changing `base`?

The theme plugin is reusing compiled CSS from a previous build. Delete the cache folder and rebuild:

```bash
rm -rf node_modules/.cache/radfish-theme
npm run build
```

### `npm ci` fails in CI with `E401`?

Your GitHub Packages token is missing or expired. Update the token secret in your CI system. The token needs the `read:packages` scope. See the [FAQ](../faq.md#token-expired).

## Resources

- [Vite: Deploying a Static Site](https://vite.dev/guide/static-deploy)
- [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode)
- [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Google Cloud: Host a static website](https://cloud.google.com/storage/docs/hosting-static-website)
