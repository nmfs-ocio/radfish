---
sidebar_position: 2
description: An overview of managing application state effectively
---

# State Management

## What is State Management?

NOAA web apps frequently deal with a variety of data. Data can range from user-generated form data to environmental statistics such as fish populations or weather changes. State management is our tool for keeping track of all these changes efficiently. Think of it as a digital notepad that records every update and change within the app. This ensures we always have the most current information at our fingertips.

## Why Use State Management in NOAA Apps?

Our applications are not just repositories of static data. They are dynamic platforms where data constantly evolves. State management is essential for several reasons:

- **Stay Updated.** Display the most up-to-date information to our users. This ensures accuracy and reliability.
- **Work Offline.** Our apps can function even without an internet connection. We do this by storing data locally and syncing it back to our servers once a connection is re-established.
- **Fast and Responsive.** Our apps to react swiftly to user interactions and data changes, providing a smooth and efficient user experience.

### A Simple Way to Manage State: Using React Context

We use a feature called **React Context** to share and manage states across different parts of our applications. This creates a communal space where any component of our app can easily access or update shared information. This feature eliminates the complexity of passing data through multiple layers.

## How We Implement State Management

### FormState

Our approach to managing form state is simple yet effective. Each form should maintain it's own state within the component itself. This is the recommended approach for managing a form's state, rather that reaching for a centralized state machine like React Context or Redux. This approach is more straightforward to implement and removes excess layers of abstraction.

One downside of this approach is that each form has it's own state management. This can lead to less DRY code. This is an acceptable tradeoff in most cases, however. If you notice that certain patterns should be shared among different components, you will either need to pass these state values as props to child components, or wrap the related components in a `ContextProvider` and expose them via the `useContext` hook. See more about how to use React Context [here](https://react.dev/reference/react/useContext).

For an example on best practices for implementing this type of form state management, you can run an example implementation with the RADFish CLI:

`npx @nmfs-radfish/create-radfish-app my-app --example computed-form-fields`

Here is a simplified code snippet on how to set this form state management up in a React component:

```jsx
const SimplifiedForm = () => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatchToast({ status: "success", message: "Successful form submission" });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Label htmlFor="fullName">Full Name</Label>
      <TextInput
        id={fullName}
        name={fullName}
        type="text"
        placeholder="Full Name"
        value={formData["fullName"] || ""}
        onChange={(event) => {
          const { value } = event.target;
          setFormData({
            ...formData,
            ["fullName"]: value,
          });
        }}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
};
```

### Flexibility and Debugging

This method allows developers to implement form state within the scope of a single file. This makes it simpler to build out forms for different use cases. If certain repeatable patterns arise, they can be broken out into a separate context provider if needed. Alternatively, they can get passed in as props to child components.

This approach provides better encapsulation and modularity. It also allows for more straightforward debugging and maintenance of form-related logic.


## Offline / Online State Management

Any NOAA web application must be fully functional offline without a network connection. Fishermen are often on ships far away from network connection. They need to reliably store data that will be uploaded to NOAA services when the app comes back online. Therefore, designing apps to be “offline first” is of vital importance to NOAA web appdevelopment.

Progressive Web Applications (PWAs) offer a robust solution for offline use at sea. They combine the benefits of an app-like experience, offline access, and efficient data management. These features make PWAs well-suited for maritime environments, where connectivity is often limited or intermittent.

PWAs leverage service workers, which are scripts that run independently in the background. Service workers enable offline functionality by caching important static resources, such as HTML, CSS, and JavaScript files. This allows the PWA to continue functioning even when there’s no network connectivity.

Read more about service workers [here](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

Service workers are integrated into the RADFish application by default. After scaffolding the application you will notice the following files:

`service-worker.js`

`serviceWorkerRegistration.js`

And the service workers is integrated into the React app in the app’s `index.js` entrypoint:

```jsx
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
```

This will register the React application as a PWA, which can be downloaded from the browser. For more information on how to download the PWA onto your device, see [this blog article](https://aureatelabs.com/blog/install-pwa-to-device/).

Additionally, you can query for whether or not the RADFish application is online or offline by leveraging the [navigator API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator).

> Note: This service worker is preconfigured when using the radfish-monorepo `react-javascript` template.

It is up to the developer on how or where this API needs to be used. It's a good idea to use it early on in your application, so that the rest of the application can listen for changes in offline state. The `@nmfs-radfish/react-radfish` package exposes a `useOfflineStatus` hook that gives you a simple way to tap into whether or not your application is online:

```jsx
import { Application, useOfflineStatus } from "@nmfs-radfish/react-radfish";

function App() {
  const { isOffline } = useOfflineStatus();

  return (
    <Application>
      <h3 className="header-body">
        Network Status: {isOffline ? "Offline ❌" : "Online ✅"}
      </h3>
    </Application>
  );
}
```

This underlying code listens for changes surfaced from the `navigator` API. It notifies the application in the form of a Toast message of the application's online/offline state.

> 🚨 **Warning:** There is a known issue where if the user's device is in an offline state, and the RADFish application is booted up for the first time, the Navigator API will actually resolve to "offline". On future refreshes, this will appropriately resolve to the "offline" status. This is an issue with the underlying Navigator API and will be addressed in a future release.

## Caching Strategy

It is important to fetch and cache required data needed to basic app functionality while the application is online. This can be done by fetching the required data from an API, and storing that data into IndexedDB. To see a basic example of how this can be done, you can run the `server-sync` example from the CLI:

`npx @nmfs-radfish/create-radfish-app my-app --example server-sync`

This example fetches several JSON arrays from our Mock API, then stores and caches it in IndexedDB. The application then can reference the data in IndexedDB without a network connection. Keep in mind that it is up to the developer to decide when and how to invalidate this IndexedDB cache based on their application's needs.

## **Offline Storage**

To use offline data storage, use the `useOfflineStorage` hook. This React hook provides methods for managing offline form data. There are two storage methods available: `LocalStorageMethod` and `IndexedDBStorageMethod`.

### Configuration

Step-by-step instructions to configure offline storage:

1. **Set the environment variables in the `.env` files. Based on which offline storage method you select, the following `env` variables are required:**
   1. Local Storage
      1. `VITE_LOCAL_STORAGE_KEY`
   2. Indexed DB:
      1. `VITE_INDEXED_DB_NAME`
      2. `VITE_INDEXED_DB_VERSION`
      3. `VITE_INDEXED_DB_TABLE_NAME`
      4. `VITE_INDEXED_DB_SCHEMA`
2. **In the `src/hooks/useOfflineStorage.js` file, initialize one of the these Storage Method instances, and pass the appropriate environment variables using `import.meta.env.REPLACE_WITH_KEY_NAME` as parameters:**

   1. `LocalStorageMethod` — Requires one parameter, the key name for localStorage.

      ```jsx
      const storageMethod = new LocalStorageMethod(
        import.meta.env.VITE_LOCAL_STORAGE_KEY
      );
      ```

   2. `IndexedDBStorageMethod` — Requires four parameters, the db name, db version, db table name, db schema.

      ```jsx
      const storageMethod = new IndexedDBStorageMethod(
        import.meta.env.VITE_INDEXED_DB_NAME,
        import.meta.env.VITE_INDEXED_DB_VERSION,
        import.meta.env.VITE_INDEXED_DB_TABLE_NAME,
        import.meta.env.VITE_INDEXED_DB_SCHEMA
      );
      ```

3. **In the `src/hooks/useOfflineStorage.js` file, create the `StorageModelFactory`:**

   ```jsx
   // 1. Choose one of the following storage methods:
   const storageMethod = new IndexedDBStorageMethod(
     import.meta.env.VITE_INDEXED_DB_NAME,
     import.meta.env.VITE_INDEXED_DB_VERSION,
     import.meta.env.VITE_INDEXED_DB_TABLE_NAME,
     import.meta.env.VITE_INDEXED_DB_SCHEMA
   );
   const storageMethod = new LocalStorageMethod(
     import.meta.env.VITE_LOCAL_STORAGE_KEY
   );
   // 2. Create Storage Method
   const storageModel = StorageModelFactory.createModel(storageMethod);
   ```

### `useOfflineStorage` Hooks API

The `useOfflineStorage` hook returns an object with the following methods:

- **`createOfflineDataEntry(data)`** creates a new data entry in the storage.
  - `data`: The data object to create.
  - Returns a promise that resolves when the data is created.
- **`findOfflineData(criteria)`** finds data in the storage based on the given criteria. It returns all data if not criteria parameter is passed.
  - `criteria`: The criteria object to use for finding data, eg `{uuid: 123}`.
  - Returns a promise that resolves to an array of tuples:
    - `[ [ uuid, { key: value } ], [ uuid2, { key: value } ] ]`
- **`updateOfflineDataEntry(criteria, data)`** updates data in the storage.
  - `criteria`: The criteria to use for updating data. This should be an object.
  - `data`: The updated data object.
  - Returns a promise that resolves to the updated data as an object:
    - `{ numberOfFish: 10, species: salmon }`

### Usage

```jsx
import useOfflineStorage from "./useOfflineStorage";

function MyComponent() {
  const { createOfflineDataEntry, findOfflineData, updateOfflineDataEntry } =
    useOfflineStorage();
  const data = { species: "Grouper", numberOfFish: 100 };

  // Create new offline data entry
  createOfflineDataEntry(data);
  // Find all offline data
  findOfflineData();
  // Find a specific offline data entry by uuid
  findOfflineData({ uuid: "1234" });
  // Update an offline data entry by uuid
  updateOfflineDataEntry({ uuid: "1234" }, data);

  // rest of code....
}

export default MyComponent;
```

---

## OfflineStorageWrapper Usage Guide

`OfflineStorageWrapper` is a context wrapper component that provides offline storage functionality to its child components through a React context. It supports both IndexedDB and LocalStorage methods.

### How to Use

**1. Wrap your component with `OfflineStorageWrapper`:**

```jsx
import { OfflineStorageWrapper } from "@nmfs-radfish/react-radfish";

<OfflineStorageWrapper config={config}>
  <YourComponent />
</OfflineStorageWrapper>;
```

The config prop is an object that specifies the storage type and configuration. It should include the `type` set to `indexedDB` or `localStorage`, database name (`string`), database version number (`number`), and stores (`object`).

The `stores` object should contain a key that is mapped as the table name. The value should be a comma separated string that outlines the schema. For more information on setting up the stores, see the official `Dexie.js` docs: [https://dexie.org/docs/Tutorial/React#3-create-a-file-dbjs-or-dbts](https://dexie.org/docs/Tutorial/React#3-create-a-file-dbjs-or-dbts).

For IndexedDB, the configuration should look like this:

```js
const config = {
  type: "indexedDB",
  name: "your_db_name",
  version: 1,
  stores: {
    table_name_1: "uuid, name",
    // Add more stores as needed
  },
};
```

For LocalStorage, the configuration should look like this:

```js
const config = {
  type: "localStorage",
  name: "your_storage_name",
};
```

**2. Use the useOfflineStorage hook in child components:**

```jsx
import { useOfflineStorage } from "@nmfs-radfish/react-radfish";

function YourComponent() {
  const {
    createOfflineData,
    findOfflineData,
    updateOfflineData,
    deleteOfflineData,
  } = useOfflineStorage();

  // Use these functions to interact with offline storage
}
```

The `useOfflineStorage` hook provides four functions:

- `createOfflineData(tableName, data):` Creates a new record in the specified table.
- `findOfflineData(tableName, criteria):` Finds records in the specified table that match the criteria.
- `updateOfflineData(tableName, data):` Updates a record in the specified table.
- `deleteOfflineData(tableName, uuid):` Deletes a record with the specified UUID from the specified table.

## Error Handling

If you try to use the `useOfflineStorage` hook outside of an `OfflineStorageWrapper`, it will throw an error. Always make sure to use `useOfflineStorage` within a component that's wrapped with `OfflineStorageWrapper`.

## Testing during development

As a developer, you'll often run into an issue where an "offline-first" feature needs to be tested before pushed and merged into the `main` branch. For instance, you may be developing a `Toast` message that notifies the user whenever they go offline. If you are simply running the local vite server, and you go offline to test your feature, you'll notice that the page breaks on page refresh. This is because the `serviceWorker` is not being used until the production build is created. In order to do this, you need to bundle the application and serve it locally to simulate a production environment:

`npm run build && npm run serve`

This will bundle the application and serve it. When you turn your browser offline, the cached static assets will remain, and your application will not break when the page is refreshed.
