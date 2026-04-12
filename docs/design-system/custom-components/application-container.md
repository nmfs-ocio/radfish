---
sidebar_position: 1
---

# Application Container

The Application container handles core application-wide functionality, including service worker integration, custom storage management, and network status detection. It provides a centralized way to manage these features within your app.

## Features

1. **Service Worker for Offline Caching**

   The Application container supports service worker integration, enabling offline capabilities by caching static assets and handling API requests when the network is unavailable.

2. **Pluggable Storage**

   Pass in IndexedDB or LocalStorage storage methods.

3. **Offline/Online Detection**

   Automatically detects network changes and displays toast notifications:

   - Offline: Shows a warning toast with "Application is offline".
   - Online: Shows an informational toast with "Application is online".

## Usage

### Setting up Application instance

To use the `Application` container, instantiate it with your desired configuration:

```jsx
import { Application } from "@nmfs-ocio/radfish";

const myApp = new Application({
  serviceWorker: {
    url:
      import.meta.env.MODE === "development"
        ? "/mockServiceWorker.js"
        : "/service-worker.js",
  },
  storage: store, // Use IndexedDBMethod or LocalStorageMethod for offline storage
});
```

### Using `<Application>`

Once instantiated, the `Application` instance should be passed to the `<Application>` component.

```jsx
import { Application } from "@nmfs-ocio/react-radfish";

<Application application={myApp} />;
```

## Distinguishing `Application` from `@nmfs-ocio/radfish` vs. `@nmfs-ocio/react-radfish`

### `@nmfs-ocio/radfish` (Core)

- Provides the underlying **non-UI logic**, such as the `Application` class for managing:
  - **Offline support**
  - **Service workers**
  - **Storage (IndexedDB, LocalStorage)**

### `@nmfs-ocio/react-radfish` (React Integration)

- Offers **React components and hooks** that make it easy to integrate `Application` container into a React app.
- Provides:
  - `<Application>` component for wrapping your app with offline support.
  - Hooks like `useOfflineStatus` for checking network connectivity.
  - `useOfflineStorage` for managing offline storage state within React components.
- This package is **React-specific** and simplifies working with the `Application` container in a React project.

#### In Other Words:

- **`@nmfs-ocio/radfish`** = the **engine** (all the logic).
- **`@nmfs-ocio/react-radfish`** = the **React car** that sits on top of the engine, making it easy to drive your offline-ready web app in React.
