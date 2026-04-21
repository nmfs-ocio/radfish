// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "RADFish Documentation",
  tagline: "Frontend Development Tooling for NOAA Developers",
  favicon: "img/favicon.ico",
  staticDirectories: ["static"],

  // Set the production url of your site here
  url: "https://nmfs-ocio.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/radfish/",
  trailingSlash: false,
  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "nmfs-ocio", // Usually your GitHub org/user name.
  projectName: "radfish", // Usually your repo name.

  onBrokenLinks: "warn",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],
  plugins: [
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexBlog: false,
        // Options here
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/radfish-logo.webp",
      navbar: {
        title: "RADFish Docs",
        logo: {
          alt: "RADFish Logo",
          src: "img/radfish-logo.webp",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "developerDocumentation",
            position: "left",
            label: "Developer Documentation",
          },
          {
            type: "docSidebar",
            sidebarId: "tutorial",
            position: "left",
            label: "Tutorial",
          },
          {
            type: "docSidebar",
            sidebarId: "designSystem",
            position: "left",
            label: "Design System",
          },
          {
            type: "docSidebar",
            sidebarId: "about",
            position: "left",
            label: "About",
          },
          {
            href: "https://github.com/nmfs-ocio",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} RADFish.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        magicComments: [
          {
            className: "code-block-diff-add-line",
            line: "diff-add",
            block: {
              start: "diff-add-start",
              end: "diff-add-end",
            },
          },
          {
            className: "code-block-diff-remove-line",
            line: "diff-remove",
            block: {
              start: "diff-remove-start",
              end: "diff-remove-end",
            },
          },
        ],
      },
    }),
};

export default config;