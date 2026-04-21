---
sidebar_position: 8
title: Theming
---

This guide explains how to customize the look and feel of your RADFish application using the RADFish theme plugin, USWDS design tokens, and SCSS.

## Setup (Existing Projects)

If you are adding theming to an existing RADFish project, follow these steps:

### 1. Install the plugin

```bash
npm install @nmfs-ocio/vite-plugin-radfish-theme
```

### 2. Copy the themes folder

Copy the `themes/` directory from the [RADFish template](https://github.com/nmfs-ocio/radfish-monorepo/tree/main/templates/react-javascript/themes) into your project root:

```
your-project/
├── themes/
│   └── noaa-theme/
│       ├── assets/
│       │   ├── logo.png
│       │   ├── favicon.ico
│       │   └── icon-512.png
│       └── styles/
│           ├── uswds-config.scss
│           └── theme.scss
├── src/
├── vite.config.js
└── ...
```

### 3. Add the plugin to vite.config.js

Import the plugin and add it to your Vite plugins array:

```javascript
import { radFishThemePlugin } from "@nmfs-ocio/vite-plugin-radfish-theme";

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      radFishThemePlugin({
        theme: "noaa-theme",
        name: "My App Name",
        shortName: "MyApp",
        description: "App description for PWA",
      }),
      // ... other plugins (e.g. VitePWA)
    ],
  };
});
```

### 4. Remove old USWDS CSS imports (older `@nmfs-radfish` projects only)

:::info
This step only applies if you are migrating from an older project that uses `@nmfs-radfish/*` packages. Projects created with `@nmfs-ocio/*` packages already have theming configured correctly and can skip this step.
:::

The theme plugin compiles and injects USWDS styles automatically. Older `@nmfs-radfish` projects may import USWDS CSS directly (e.g. from `@trussworks/react-uswds`). **You must remove those imports** or they will override your theme colors.

Look for and remove lines like these from your CSS files (commonly in `src/index.css`):

```css
/* REMOVE THESE -- the theme plugin handles USWDS styles now */
@import "@trussworks/react-uswds/lib/uswds.css";
@import "@trussworks/react-uswds/lib/index.css";
```

:::warning
This is the most common cause of theme colors not applying when migrating older projects. The default USWDS CSS loads after the theme plugin's compiled CSS and overwrites your custom tokens.
:::

### 5. Clear cache and restart

```bash
rm -rf node_modules/.cache/radfish-theme
npm start
```

## Quick Start

Theme customization is split across two files:

| File | Purpose |
|------|---------|
| `themes/noaa-theme/styles/uswds-config.scss` | USWDS token variable overrides (colors, spacing) |
| `themes/noaa-theme/styles/theme.scss` | CSS custom properties and component overrides |

After editing either file, save it. The dev server detects changes and automatically recompiles.

## How It Works

The RADFish theme plugin (`vite-plugin-radfish-theme`) runs at build time and during development:

1. **Parses `uswds-config.scss`** and extracts SCSS `$variables` for USWDS configuration
2. **Pre-compiles USWDS** with your color tokens into a static CSS file (with MD5-based caching)
3. **Compiles `theme.scss`** to CSS for custom properties and component overrides
4. **Injects CSS** into your app via `<link>` tags in `index.html`
5. **Generates `manifest.json`** with your app name, description, and theme colors
6. **Watches for changes** and auto-recompiles on save during development

### Directory Structure

```
themes/noaa-theme/
├── assets/                    # Icons and logos
│   ├── logo.png              # Header logo
│   ├── favicon.ico           # Browser favicon
│   └── icon-512.png          # PWA icon (any + maskable)
└── styles/
    ├── uswds-config.scss     # USWDS token variable overrides
    └── theme.scss            # CSS custom properties + component overrides

node_modules/.cache/radfish-theme/noaa-theme/   # Auto-generated (don't edit)
├── _uswds-entry.scss         # Generated USWDS config
├── uswds-precompiled.css     # Compiled USWDS styles
├── theme.css                 # Compiled theme overrides
└── .uswds-cache.json         # Cache manifest
```

### CSS Load Order

Styles are loaded in this order, ensuring correct CSS cascade:

1. **`uswds-precompiled.css`** -- USWDS compiled with your color tokens
2. **`theme.css`** -- Your CSS custom properties and component overrides from `theme.scss`
3. **`src/styles/style.css`** -- Your application-specific page and layout styles

## USWDS Token Variables

In `uswds-config.scss`, define SCSS variables that configure the USWDS design system. These variables use the USWDS naming convention (`$theme-color-*`) and are passed to USWDS via `@use "uswds-core"`. They don't produce CSS output directly -- they configure the design system's color palette.

```scss
// themes/noaa-theme/styles/uswds-config.scss

// Primary colors
$theme-color-primary: #0055a4;
$theme-color-primary-dark: #00467f;
$theme-color-primary-light: #59b9e0;

// Secondary colors
$theme-color-secondary: #007eb5;
$theme-color-secondary-dark: #006a99;

// State colors
$theme-color-error: #d02c2f;
$theme-color-success: #4c9c2e;
$theme-color-warning: #ff8300;
$theme-color-info: #1ecad3;

// Base/neutral colors
$theme-color-base-lightest: #ffffff;
$theme-color-base-lighter: #e8e8e8;
$theme-color-base: #71767a;
$theme-color-base-darkest: #333333;
```

### Available Tokens

| Category | Tokens |
|----------|--------|
| **Base** | `theme-color-base-lightest`, `theme-color-base-lighter`, `theme-color-base-light`, `theme-color-base`, `theme-color-base-dark`, `theme-color-base-darker`, `theme-color-base-darkest` |
| **Primary** | `theme-color-primary-lighter`, `theme-color-primary-light`, `theme-color-primary`, `theme-color-primary-vivid`, `theme-color-primary-dark`, `theme-color-primary-darker` |
| **Secondary** | `theme-color-secondary-lighter`, `theme-color-secondary-light`, `theme-color-secondary`, `theme-color-secondary-vivid`, `theme-color-secondary-dark`, `theme-color-secondary-darker` |
| **Accent Cool** | `theme-color-accent-cool-lighter`, `theme-color-accent-cool-light`, `theme-color-accent-cool`, `theme-color-accent-cool-dark`, `theme-color-accent-cool-darker` |
| **Accent Warm** | `theme-color-accent-warm-lighter`, `theme-color-accent-warm-light`, `theme-color-accent-warm`, `theme-color-accent-warm-dark`, `theme-color-accent-warm-darker` |
| **State** | `theme-color-info`, `theme-color-error`, `theme-color-warning`, `theme-color-success` (each with `-lighter`, `-light`, `-dark`, `-darker` variants) |
| **Disabled** | `theme-color-disabled-light`, `theme-color-disabled`, `theme-color-disabled-dark` |

See [USWDS Color Theme Tokens](https://designsystem.digital.gov/design-tokens/color/theme-tokens/) for the complete list.

## CSS Custom Properties

In `theme.scss`, add a `:root` block with CSS custom properties for agency-specific colors that go beyond what USWDS provides:

```scss
// themes/noaa-theme/styles/theme.scss

:root {
  // Brand colors
  --noaa-process-blue: #0093D0;
  --noaa-reflex-blue: #0055A4;

  // Regional colors
  --noaa-region-alaska: #FF8300;
  --noaa-region-west-coast: #4C9C2E;
  --noaa-region-southeast: #B2292E;
}
```

Use these anywhere in your application CSS:

```css
.region-badge--alaska {
  background-color: var(--noaa-region-alaska);
}
```

### Auto-Generated Variables

The plugin also auto-generates `--radfish-color-*` CSS variables from your USWDS token values. These are injected into `:root` via `index.html` and available throughout your app:

- `--radfish-color-primary`
- `--radfish-color-primary-dark`
- `--radfish-color-secondary`
- `--radfish-color-error`
- `--radfish-color-success`
- `--radfish-color-warning`
- `--radfish-color-info`
- `--radfish-color-base-lightest`
- etc.

Every USWDS token you define in `uswds-config.scss` gets a corresponding `--radfish-color-*` variable. Use these in component overrides and application styles for consistency:

```css
.my-component {
  border-left: 4px solid var(--radfish-color-primary);
  background: var(--radfish-color-base-lightest);
}
```

## Component Overrides

In the component overrides section of `theme.scss`, add custom CSS to override USWDS and RADFish component styles. You can reference both your custom properties and the auto-generated `--radfish-color-*` variables:

```scss
// themes/noaa-theme/styles/theme.scss

/* Header background */
header.usa-header {
  background-color: var(--radfish-color-primary);
}

/* Custom button styles */
.usa-button {
  border-radius: 8px;
  font-weight: 600;
}

/* Custom card styles */
.usa-card {
  border-color: #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Available USWDS Components

| Category | Classes |
|----------|---------|
| **Layout & Navigation** | `usa-header`, `usa-footer`, `usa-sidenav`, `usa-breadcrumb`, `usa-banner` |
| **Forms & Inputs** | `usa-button`, `usa-input`, `usa-checkbox`, `usa-radio`, `usa-select`, `usa-form` |
| **Content & Display** | `usa-card`, `usa-alert`, `usa-table`, `usa-list`, `usa-accordion`, `usa-tag` |
| **Interactive** | `usa-modal`, `usa-tooltip`, `usa-pagination` |

See the full list at [USWDS Components](https://designsystem.digital.gov/components/).

## Application Styles

For page-level and layout styles that are specific to your application (not theme configuration), use:

```
src/styles/style.css
```

This file is loaded after theme styles, so you can override anything:

```css
/* src/styles/style.css */

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.fish-data-card {
  background: var(--radfish-color-base-lightest);
  border: 1px solid #ddd;
  padding: 1.5rem;
}
```

:::tip
Keep theme colors and component overrides in `theme.scss`. Use `src/styles/style.css` only for page layouts and app-specific components.
:::

## Configuration

### App Metadata

In `vite.config.js`, configure the app name and description via the plugin options:

```javascript
import { radFishThemePlugin } from "@nmfs-ocio/vite-plugin-radfish-theme";

radFishThemePlugin({
  theme: "noaa-theme",
  name: "My App Name",
  shortName: "MyApp",
  description: "App description for PWA",
})
```

The `theme` option is the theme folder name under `themes/`.

### Environment Variables

The plugin exposes values as `import.meta.env.RADFISH_*` constants, available in your React components:

| Variable | Description |
|----------|-------------|
| `import.meta.env.RADFISH_APP_NAME` | Full app name |
| `import.meta.env.RADFISH_SHORT_NAME` | Short name (used in PWA) |
| `import.meta.env.RADFISH_DESCRIPTION` | App description |
| `import.meta.env.RADFISH_LOGO` | Path to header logo |
| `import.meta.env.RADFISH_FAVICON` | Path to favicon |
| `import.meta.env.RADFISH_PRIMARY_COLOR` | Primary theme color |
| `import.meta.env.RADFISH_SECONDARY_COLOR` | Secondary theme color |
| `import.meta.env.RADFISH_THEME_COLOR` | PWA manifest theme color |
| `import.meta.env.RADFISH_BG_COLOR` | PWA manifest background color |

Example usage in a component:

```jsx
<img
  src={import.meta.env.RADFISH_LOGO}
  alt={import.meta.env.RADFISH_APP_NAME}
/>
```

## Changing Assets

Replace files in `themes/noaa-theme/assets/` to customize branding. Keep the same filenames:

| File | Purpose | Recommended Size |
|------|---------|------------------|
| `logo.png` | Header logo | Height ~48-72px |
| `favicon.ico` | Browser tab icon | 64x64, 32x32, 16x16 |
| `icon-512.png` | PWA icon/splash | 512x512 |

In development, assets are served from the theme directory. On build, they are copied to `dist/icons/`.

## Creating a New Theme

1. Create the theme folder structure:

   ```bash
   mkdir -p themes/my-agency/assets themes/my-agency/styles
   ```

2. Add your brand assets to `themes/my-agency/assets/`:
   - `logo.png`, `favicon.ico`, `icon-512.png`

3. Copy and customize the theme files:

   ```bash
   cp themes/noaa-theme/styles/uswds-config.scss themes/my-agency/styles/
   cp themes/noaa-theme/styles/theme.scss themes/my-agency/styles/
   ```

4. Edit `themes/my-agency/styles/uswds-config.scss` with your agency's USWDS color tokens.

5. Edit `themes/my-agency/styles/theme.scss` with your CSS custom properties and component overrides.

6. Update `vite.config.js` to use the new theme:

   ```javascript
   radFishThemePlugin({
     theme: "my-agency",
     name: "My Agency App",
   })
   ```

7. Restart the dev server.

## Troubleshooting

### Theme colors not applying?

- **Check for old USWDS CSS imports.** This is the most common issue. Remove any direct imports of USWDS CSS (e.g. `@import "@trussworks/react-uswds/lib/uswds.css"`) from your stylesheets. The theme plugin handles USWDS compilation and injection.
- **Check that the plugin is in vite.config.js.** The plugin must be imported and added to the `plugins` array.
- Inspect element in DevTools to see which stylesheet is setting the color.

### Changes not appearing?

- Save `uswds-config.scss` or `theme.scss` -- the dev server auto-restarts on changes
- Clear browser cache: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Restart dev server: `npm start`

### Styles not applying?

- Check CSS specificity -- you may need more specific selectors
- Inspect element in DevTools to see which styles are being applied
- Ensure your selectors match USWDS class names exactly

### Cache issues?

Delete the cache folder and restart:

```bash
rm -rf node_modules/.cache/radfish-theme
npm start
```

## Resources

- [USWDS Design System](https://designsystem.digital.gov/)
- [USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/)
- [USWDS Components](https://designsystem.digital.gov/components/)
- [React USWDS (Trussworks)](https://trussworks.github.io/react-uswds/)
