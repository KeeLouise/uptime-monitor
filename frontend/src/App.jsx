import { useEffect, useState, useRef } from "react";
import ProblemCard from "./components/ProblemCard.jsx";
import HealthyList from "./components/HealthyList.jsx";
import AddSiteForm from "./components/AddSiteForm.jsx";
import LoginForm from "./components/LoginForm.jsx";


function App() {
  const [sites, setSites] = useState([]);
  const [live, setLive] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [focusTarget, setFocusTarget] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const mainHeadingRef = useRef(null);




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
        setError("Can't reach the server. We'll keep trying every 30 seconds.");
      }
    }

    if (!live) {
      return;
    }

    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [live, reloadKey]);

  useEffect(() => {
    async function checkLogin() {
      const response = await fetch("/api/me");
      const data = await response.json();
      setIsAdmin(data.admin);
    }
    checkLogin();
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    })
    setIsAdmin(false)
    setFocusTarget("login");


  }

    function handleDeleted(url) {
    setAnnouncement(`Deleted ${url}.`);
    setReloadKey(reloadKey + 1);
  }

  useEffect(() => {
    if (announcement) {
      mainHeadingRef.current.focus();
    }
  }, [announcement]);


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
          {lastChecked && (
            <span className="last-checked">
              Last checked {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            className={live ? "button" : "button button--paused"}
            onClick={() => setLive(!live)}
          >
            {live ? "Pause live updates" : "Resume live updates"}
          </button>
          {isAdmin && (
            <button type="button" className="button" onClick={handleLogout}>
              Log out
            </button>
          )}
        </div>
      </header>

      {error && <p className="error-banner" role="alert">{error}</p>}


      <div className="layout">
        <main id="main">
          <h1 className="page-title" ref={mainHeadingRef} tabIndex={-1}>Needs attention</h1>
          <p role="status" className="sr-only">{announcement}</p>
          <p className="page-intro">Most urgent first.</p>

          {lastChecked === null ? (
            <p className="page-intro">Loading your sites…</p>
          ) : problems.length === 0 ? (
            <p className="empty">Nothing needs attention. Every site is up.</p>
          ) : (
            <ol className="problem-list">
              {problems.map((site) => (
                <li key={site.id}>
                  <ProblemCard site={site} isAdmin={isAdmin} onDeleted={handleDeleted} />
                </li>
              ))}
            </ol>
          )}
        </main>

        <aside aria-label="Healthy sites and add a site">
          <HealthyList sites={healthy}  isAdmin={isAdmin} onDeleted={handleDeleted}/>
          {isAdmin ? (
            <AddSiteForm
              onAdded={() => setReloadKey(reloadKey + 1)}
              focusOnMount={focusTarget === "add"}
            />
          ) : (
            <LoginForm
              onLoggedIn={() => {
                setIsAdmin(true);
                setFocusTarget("add");
              }}
              focusOnMount={focusTarget === "login"}
            />
          )}
        </aside>
      </div>
    </>
  );
}

export default App;