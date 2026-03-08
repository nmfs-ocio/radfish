---
sidebar_position: 9
description: Manage app routes with React Router
---

# Routing

The **Routing** in RADFish applications is handled using `react-router-dom`. This section will guide you through the basic setup and usage of routing in your project.

## React Router Overview

React Router provides a declarative, component-based approach to defining routes and managing navigation in React applications. It supports nested routes, dynamic route matching, and lazy loading of components.

To learn about React Router, refer to the official [React Router documentation](https://reactrouter.com/).

### Features

- **Declarative Routing.** Define routes in a declarative manner using components like `Routes`, `Route`, and `Link`.
- **Dynamic Routing.** Easily create routes that can change based on the application's state or URL parameters.
- **Nested Routing.** Support for nested routes, allowing more complex routing configurations.
- **Programmatic Navigation.** Use React Router hooks like `useNavigate` to navigate programmatically.

### Usage

In this project, routing is set up in the `App.jsx` file. This section provides a breakdown of the main components used for routing.

**Basic Setup**

First, import the necessary components from `react-router-dom`:

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
```

**Defining Routes**

Use the BrowserRouter to wrap your application and define routes with the Routes and Route components:

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
  </Routes>
</BrowserRouter>
```

This setup ensures that when users navigate to the root URL (/), the HomePage component is rendered.

**Navigation Links**

To navigate between different routes, use the Link component:

```jsx
<Link to="/">Home</Link>
```

This setup provides a navigation link to the home page.

### Example Code

You can view the full example of the routing setup in the `App.jsx` file in the GitHub repository: [github/boilerplate/templates/react-javascript/src/App.jsx](https://github.com/NMFS-ocio/boilerplate/blob/main/templates/react-javascript/src/App.jsx)

```jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```
