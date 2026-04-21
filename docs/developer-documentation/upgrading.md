---
sidebar_position: 7
---

# Upgrading

## How to keep your RADFish project up to date

Updating your RADFish version ensures stability, security, and the latest features. It also keeps your project free of warnings and errors. This section provides a step-by-step guide on how to update your RADFish packages. 

### Upgrade Packages

    1. **Run command:** In the root of your project, run:
        ```bash
        npm update
        ```

        This will update both `@nmfs-ocio/radfish` and `@nmfs-ocio/react-radfish` along with their dependencies to the latest compatible versions.

    2. **Check for Changes:**  After running the update, you should verify that everything is working as expected. It's a good practice to run your test suite to catch any potential issues:
        ```bash
        npm test
        ```

### Handling Warnings During Updates

    While updating your packages, you might encounter warnings. These warnings may not necessarily be RADFish-specific. These warnings often occur when certain packages in your project are outdated or incompatible. To get rid of these warnings:

    1. **Check for outdated packages:** Run the command below to list all outdated packages, including those not related to RADFish.
        ```bash
        npm outdated
        ```

    2. **Update dependencies:** You can selectively update non-react-radfish packages by running:
        ```bash
        npm update <package-name>
        ```

    3. **Resolve peer dependency warnings:** Some warnings may be related to peer dependencies. To resolve these, you might need to install or update the required dependencies manually.
        ```bash
        npm install <peer-dependency-name>
         ```

    4. **Remove deprecated packages:** If the warning is about deprecated packages, it’s a good idea to check if these packages are still necessary and remove them if they’re not.
        ```bash
        npm uninstall <deprecated-package>
        ```

### Migrating from `@nmfs-radfish` to `@nmfs-ocio`

If your project was originally set up using the `@nmfs-radfish` npm packages, you will need to migrate to the `@nmfs-ocio` GitHub registry packages. This is a scope change, not a version update, so `npm update` will not handle it automatically.

1. **Uninstall the old packages:**
    ```bash
    npm uninstall @nmfs-radfish/radfish @nmfs-radfish/react-radfish @nmfs-radfish/create-radfish-app
    ```

2. **Configure the GitHub registry** (if you haven't already). See the [Getting Started prerequisites](./getting-started.mdx) for setup instructions.

3. **Install the new packages:**
    ```bash
    npm install @nmfs-ocio/radfish @nmfs-ocio/react-radfish
    ```

    :::tip
    If you encounter peer dependency errors during installation, you may need to use `npm install --legacy-peer-deps`. This can happen if your project uses React 19 and the packages haven't updated their peer dependencies yet.
    :::

4. **Update imports** across your project. Replace all references from the old scope to the new one:
    ```diff
    - import { ... } from '@nmfs-radfish/radfish';
    + import { ... } from '@nmfs-ocio/radfish';

    - import { ... } from '@nmfs-radfish/react-radfish';
    + import { ... } from '@nmfs-ocio/react-radfish';
    ```

5. **Run your tests** to verify everything works:
    ```bash
    npm test
    ```

### Overview of Packages Managed in `radfish` and `react-radfish`

In your RADFish project, these packages are managed and should be kept up to date:
- `@nmfs-ocio/radfish`
- `@nmfs-ocio/react-radfish`

#### `@nmfs-ocio/radfish`
This package handles the core logic and utilities for RADFish. It manages several dependencies that are essential for the functionality of the RADFish system:

   - **Dependencies:**
        - `dexie`: A minimalistic IndexedDB wrapper for managing databases.
        - `msw`: A library for mocking API requests in development and testing environments.
        - `react`: The core React library required for building user interfaces in RADFish projects.

#### `@nmfs-ocio/react-radfish`

   This package provides UI components for React applications using RADFish. It manages several dependencies that enhance the user interface and functionality:

   - **Dependencies:**
        - `@tanstack/react-table`: A headless table library for building powerful data tables in React.
        - `@trussworks/react-uswds`: A component library that implements the U.S. Web Design System (USWDS) for React.

   - **DevDependencies**:
        - `@testing-library/dom`: Utility for testing DOM nodes.
        - `@testing-library/jest-dom`: Custom Jest matchers for asserting on DOM nodes.
        - `@testing-library/react`: Testing utilities for React components.
        - `@vitejs/plugin-react`: A Vite plugin that provides React support.
        - `jsdom`: JavaScript implementation of the DOM for testing.
        - `vite-plugin-css-injected-by-js`: A Vite plugin for injecting CSS in JavaScript.
        - `vitest`: A Vite-native unit testing framework.
