import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'IT Knowledge Base & Docs',
  tagline: 'Technical scenarios, migration guides, and solutions',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://dipakkadamb.github.io', // or https://dipakkadamb.in
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/it-docs/',

  // GitHub pages deployment config.
  organizationName: 'dipakkadamb', // Usually your GitHub org/user name.
  projectName: 'it-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/your-company/it-docs/tree/main/',
        },
        blog: false, // Disable the blog feature
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'IT Docs',
        logo: {
          alt: 'IT Docs Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            href: 'https://dipakkadamb.in/',
            label: '← Main Portfolio',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/dipakkadamb/it-docs',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Migration Guides',
                to: '/docs/Migration-Guides/Scenario_Windows_Server_Migration',
              },
              {
                label: 'Templates',
                to: '/docs/Article_Template',
              },
            ],
          },
          {
            title: 'Portfolio',
            items: [
              {
                label: 'Main Website',
                href: 'https://dipakkadamb.in',
              },
              {
                label: 'Contact',
                href: 'https://dipakkadamb.in/#contact',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Dipak Kadam IT Knowledge Base. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['powershell', 'bash', 'json', 'yaml'], // Syntax highlighting for IT tasks
      },
    }),
};

export default config;
