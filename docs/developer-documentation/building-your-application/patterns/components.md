---
sidebar_position: 5
description: Learn to build and structure your components
---

# Components and Usage

## Building your first page and form

RADFish uses standard components from the [`react-uswds`](https://github.com/trussworks/react-uswds) open source project. The RADFish project further extends the react-uswds library. These components maintain the functionality of react-uswds, but are branded with NOAA themes and styles. To learn more about these extended components and how to use them, visit the [Custom Components](https://nmfs-ocio.github.io/radfish/design-system/custom-components) documentation. This allows for development in a modern React environment with a NOAA look and feel.

For more information on the full `react-uswds` library, check out the deployed storybook: [https://trussworks.github.io/react-uswds/](https://trussworks.github.io/react-uswds/?path=/docs/welcome--docs)

### Example

If you wanted to build a `TextInput` component into an existing form, you can use the `@trussworks` [storybook reference](https://trussworks.github.io/react-uswds/?path=/docs/components-text-input--docs) related to component props that are available.

```jsx

import { TextInput, Label } from "@trussworks/react-uswds";

<Label htmlFor="fullName">Full Name</Label>
<TextInput
  id="fullName"
  name="fullName"
  type="text"
  placeholder="Full Name"
  value={formData["fullName"] || ""}
  aria-invalid={validationErrors.fullName ? "true" : "false"}
  validationStatus={validationErrors.fullName ? "error" : undefined}
  onChange={handleChange}
  onBlur={(e) => handleBlur(e, fullNameValidators)}
/>
```

### Forms

Controlled forms are a key aspect of any NOAA application. Forms are used to collect data relevant to that application in the context of the user. For example, forms can intake data related to trip reports or admin applications.

To learn how to build a form, refer to the [State Management](./state-management.md) documentation.

### Tables

Tables are also a key component type for all NOAA applications. These components usually help visualize data in a user-friendly manner. However, there are cases where developers may want this data to be writable (ie: submittable) to a backend. Using caching strategies with IndexedDB ensures that these types of components remain fully functional when offline.

To learn how to build a table, refer to the [State Management](./state-management.md) documentation.

## Styling Methodology: BEM

In our **examples** and **templates**, we follow the **Block Element Modifier (BEM)** methodology for organizing CSS classes. BEM helps create a structured and scalable CSS architecture. This makes it easier to understand where CSS classes belong and how they relate to components. It also promotes consistency and readability, especially in larger codebases.

We use BEM for other reasons as well:

- **Clarity.** BEM conventions make it clear how styles are applied across different parts of a component.
- **Modularity.** BEM encourages the separation of styling concerns, making components more modular and reusable.
- **Scalability.** As your project grows, BEM helps maintain organized and manageable CSS.

For more information on BEM and how it works, you can visit the official BEM documentation: [https://getbem.com](https://getbem.com).

### Flexibility for Your Project:

We use BEM in our **examples** and **templates** to enhance code clarity and consistency. However, you are not required to adopt BEM in your own project. Feel free to use any CSS methodology or framework that suits your needs. This might be BEM, CSS Modules, Tailwind, or any other approach.

Our use of BEM is limited to the examples and templates provided. It doesn’t affect how you structure your own styles. You can implement your own styling approach while using the components in our examples.
