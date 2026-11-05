import { useEffect, useState } from "react";
import ProblemCard from "./components/ProblemCard.jsx";
import HealthyList from "./components/HealthyList.jsx";

function App() {
  const [sites, setSites] = useState([]);
  const [live, setLive] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/sites");
        if (!response.ok) {
          throw new Error(`Server error ${response.status}`);
        }
        const data = await response.json();
        setSites(data);
        setLastChecked(new Date());
        setError(null);
      } catch {
        setError("Cant reach the server. We'll keep trying every 30 seconds.");
      }
    }

    if (!live) {
      return;
    }

    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [live]);

  const problems = sites.filter((site) => site.status !== "up");
  const healthy = sites.filter((site) => site.status === "up");

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>

      <header className="app-header">
        <span className="app-name">Uptime Monitor</span>
        {lastChecked && (<p className="summary" aria-live="polite">
          {problems.length} need attention, {healthy.length} healthy.
        </p>
        )}

        <div className="header-controls">
          {lastChecked === null ? (
            <p className="page-intro">Loading your sites…</p>
          ) : problems.length === 0 ? (
            <p className="empty">Nothing needs attention. Every site is up.</p>
          ) : (
            <ol className="problem-list">
              ...unchanged...
            </ol>
          )}
          <button
            type="button"
            className={live ? "button" : "button button--paused"}
            onClick={() => setLive(!live)}
          >
            {live ? "Pause live updates" : "Resume live updates"}
          </button>
        </div>
      </header>

      {error && <p className="error-banner" role="alert">{error}</p>}


      <div className="layout">
        <main id="main">
          <h1 className="page-title">Needs attention</h1>
          <p className="page-intro">Most urgent first.</p>

          {problems.length === 0 ? (
            <p className="empty">Nothing needs attention. Every site is up.</p>
          ) : (
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