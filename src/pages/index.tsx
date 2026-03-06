import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/Migration-Guides/Scenario_Windows_Server_Migration">
            View Example Case Study 🚀
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Technical documentation, case studies, and migration guides">
      <HomepageHeader />
      <main>
        <div className="container" style={{ padding: '2rem 0' }}>
          <div className="row">
            <div className="col col--4">
              <h3>📚 Extensive Knowledge Base</h3>
              <p>Explore step-by-step guides, best practices, and infrastructure documentation.</p>
            </div>
            <div className="col col--4">
              <h3>🔄 Real World Migrations</h3>
              <p>Detailed case studies showcasing zero-downtime server and cloud migrations.</p>
            </div>
            <div className="col col--4">
              <h3>🛠️ Tools & Scripts</h3>
              <p>A repository of automation scripts in PowerShell, Docker, and Terraform.</p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
