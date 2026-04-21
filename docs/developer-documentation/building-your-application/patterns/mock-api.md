---
sidebar_position: 4
description: Simulate backend responses to unblock your development
---

# Mock API

As a frontend developer, you may be developing a feature that has a dependency on an external API. This dependency sometimes becomes a blocker. You must wait for the external API endpoints to be developed before you can build your feature. The RADFish app ships with a built-in mock server that allows frontend developers to “stub out” and mock API requests. This mock API removes the hard dependency during development.

More specifically, RADFish ships with [mock service worker](https://mswjs.io/). This service is preconfigured in the radfish-monorepo boilerplate application.

At the entrypoint of the React application, we enable API mocking with the `enableMocking` function:

```jsx
async function enableMocking() {
  const { worker } = await import("./mocks/browser");

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start();
}

const root = ReactDOM.createRoot(document.getElementById("root"));

enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

Keep in mind that mocking should only be available during development. It should not ship with the production application. It can be useful to use a `NODE_ENV` environment variable to ensure that API mocks are only used in `DEVELOPMENT`. The `public/mockServiceWorker.js` file installs and configures the mock server. You should not need to modify this file.

## Configuring mock endpoints:

In `src/mocks` there is a `browser.js` file and a `handlers.js` file. Developers can add different mock http handlers to their application in the `handlers.js` file. For each handler you create, the mock service worker will intercept the request, and handle that request as defined in the file.

For instance:

```jsx
export const handlers = [
  http.get("/species", () => {
    return HttpResponse.json({ data: ["grouper", "marlin"] }, { status: 200 });
  }),
  http.post("/species", async ({ request }) => {
    const response = await request.json();
    return HttpResponse.json({ data: response }, { status: 201 });
  }),
];
```

This file creates two handlers, a `GET` and `POST` request that returns a `HttpResponse` to the application. Refer to the [msw docs](https://mswjs.io/) for more information on customizing this for your needs.

---
