---
sidebar_position: 1
---

# Getting Started

Create RADFish App is the officially supported tool for creating single-page React applications. It offers a modern build setup with no configuration.

## Prerequisites

Before you start, make sure you have the following installed:

- [x] Node.js (v20.17.0 or later)
- [x] npm (v10.8.2 or later)
- [x] git (v2.0 or later)

## Quick Start

### Option 1: Scaffold a new app from a template

Start your app with a barebones and pre-configured [template](./examples-and-templates#templates).

```bash
npx @nmfs-radfish/create-radfish-app my-app
cd my-app
npm start
```

Once the development server starts, visit http://localhost:3000/ in your browser to see your app.

### Option 2: Scaffold a new app from an example

Select an [example](/radfish/developer-documentation/examples-and-templates) and run [the command](./building-your-application/available-scripts/running-example.md) using the `--example` tag.

```bash
npx @nmfs-radfish/create-radfish-app my-app --example multistep-form
cd my-app
npm start
```

### Option 3: Clone the boilerplate repository to access all examples

To get all the examples, clone the [boilerplate repository](https://github.com/nmfs-ocio/radfish-monorepo):

```bash
git clone https://github.com/nmfs-ocio/radfish-monorepo.git
```

Then navigate to the example you want to run and start the app:

```bash
cd boilerplate/examples/[example you want to run]
npm install
npm start
```

Once the development server starts, visit http://localhost:3000/ in your browser to see your app.

### Using the help flag

The `--help` flag is a common option that displays helpful information about a command or script, including available options and usage instructions.

```bash
npx @nmfs-radfish/create-radfish-app --help
```

### Upgrading package versions in your app

1. In the root of your project run:
    ```bash
    npm update
    ```

2. Check for Changes:
    ```bash
    npm test
    ```
Please visit [upgrading](./upgrading.md) for more information. 

## Scripts

**`npm start`**

This script starts the Vite development server. It runs the app locally with hot module reloading, allowing for fast development and instant updates as you make changes. Open [http://localhost:3000](http://localhost:3000/) to view it in the browser.

See [Available Scripts](./building-your-application/available-scripts) for full list of commands.

## Next steps
Now that you are up and running, see the [Components & Usage](./building-your-application/patterns/components.md) section to start building out your first pages!
