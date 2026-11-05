import { useEffect, useState } from "react";
import ProblemCard from "./components/ProblemCard.jsx";
import HealthyList from "./components/HealthyList.jsx";

function App() {
  const [sites, setSites] = useState([]);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/sites");
      const data = await response.json();
      setSites(data);
    }
    load();
  }, []);

  const problems = sites.filter((site) => site.status !== "up");
  const healthy = sites.filter((site) => site.status === "up");

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>

      <header className="app-header">
        <span className="app-name">Uptime Monitor</span>
        <p className="summary">
          {problems.length} need attention, {healthy.length} healthy.
        </p>
      </header>

      <div className="layout">
        <main id="main">
          <h1 className="page-title">Needs attention</h1>
          <p className="page-intro">Most urgent first.</p>

          {problems.length === 0 ? (
            <p className="empty">Nothing needs attention. Every site is up.</p>
          ): (
            <ol className="problem-list">
              {problems.map((site) => (
                <li key={site.id}>
                  <ProblemCard site={site} />
                </li>
              ))}
            </ol>
          )}
        </main>

        <aside aria-label="Healthy sites">
          <HealthyList sites={healthy} />
        </aside>
      </div>
    </>
  );
}

export default App;