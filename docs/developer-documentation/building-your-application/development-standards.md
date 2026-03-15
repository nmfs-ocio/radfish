---
sidebar_position: 2
description: USWDS, NOAA branding and Styling, and 508 compliance
---

# Development Standards

## USWDS

The U.S. Web Design System (USWDS) is a set of design and development principles and guidelines. It helps deveolpers create standardized, accessible, consistent, and user-friendly websites and applications. It helps developers adhere to 508 compliance guidelines.

In most cases, RADFish uses standard components from the [`react-uswds`](https://github.com/trussworks/react-uswds) open source project. The RADFish project further extends the react-uswds library. These components maintain the functionality of react-uswds, but are branded with NOAA themes and styles. To learn more about these extended components and how to use them, visit the [Custom Components](https://nmfs-ocio.github.io/radfish/design-system/custom-components) documentation. This allows modern React development with NOAA look and feel.

For information on the full `react-uswds` library, refer to their [storybook](https://trussworks.github.io/react-uswds/?path=/docs/welcome--docs).

Building applications with `react-radfish` leads to faster development, consistent design, and ensures compliance with government regulations. The [`react-uswds` storybook](https://trussworks.github.io/react-uswds/?path=/docs/welcome--docs) provides examples of compliant components that can be used to build apps for various use cases.

<!--
<aside>
If you need another component for your application support, please see `CONTRIBUTING` section (In progress)
</aside>
-->

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

---

## NOAA Branding Guidelines and Style Guide

Branding creates a distinct identity for a product or application. It defines and maintains a set of visual elements that represent the brand. Branding can include logos, colors, and typography standards.

You might have noticed that the components above do not have any `className` assigned. You may be wondering how to style that component. There are a few things to keep in mind when styling components:

- Each component in `react-radfish` has it’s own scoped CSS file. This file modifies the existing `@trussworks` CSS to inject NOAA styles. This file should not be touched. If you notice a bug or issue, please consider [contributing to the project](https://nmfs-ocio.github.io/radfish/about/contribute).
- You can modify the general theme of these components in the `styles/theme.css` file. You can change things like color variables, font-family, and line-height here. They will be propagated throughout the application, as well as throughout `react-radfish`. RADFish uses CSS variables, like this:

```css
// styles/theme.js
:root {
  --noaa-dark-blue: #0054a4;
}

// form.css
.your-custom-class {
  background-color: var(--noaa-dark-blue);
}
```

- If you need to add additional styles to a particular component, you can add another `className` **after** the component has been imported from `react-radfish`:

```jsx
import { Label } from "@nmfs-radfish/react-radfish";

<Label htmlFor="fullName" className="your-custom-class">
  Full Name
</Label>;
```

By following this method, you can use the `uswds` component, while still maintaining the NOAA themes. You can also extend it further to suit your needs as a developer.

## 508 Compliance (Section 508 of the Rehabilitation Act)

Section 508 compliance refers to the adherence to accessibility standards outlined in [Section 508 of the Rehabilitation Act](https://www.section508.gov/). For web developers, it means designing and developing content that's accessible to individuals with disabilities. In other words, 508 compliant websites can be navigated and understood by users with various disabilities. For example, there are guidelines that aid those with visual or auditory impairments. Developers must follow these guidelines to ensure their websites are accessible and usable by everyone. This promotes an inclusive and diverse online experience.

Because NOAA is a governmental agency, Section 508 compliance is required for the development of frontend apps. NOAA provides vital information related to weather, oceans, and atmospheric conditions. Individuals with diverse abilities need to access and use these resources.

Section 508 compliance is a driving factor for many decisions we make in RADFish about our UX strategies. We have also extended a compliant component library in `@trussworks/react-uswds`.

### Resources
Read more about 508 compliance here: [https://www.section508.gov/](https://www.section508.gov/)
