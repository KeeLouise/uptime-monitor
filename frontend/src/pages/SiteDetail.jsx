import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";

function SiteDetail() {
    const { id } = useParams();
    const [site, setSite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const headingRef = useRef(null);

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch("/api/sites");
                if (!response.ok) {
                    throw new Error(`Server error ${response.status}`);
                }
                const sites = await response.json();
                const found = sites.find((s) => s.id === Number(id));
                setSite(found ?? null);

            } catch {
                setError("Can't reach the server.");
            }
            setLoading(false);
        }
        load();
    }, [id]);

    // When the site has loaded, set the tab title and move focus to the heading (AAA)
    useEffect(() => {
        if (site) {
            document.title = `${site.url}: Uptime Monitor`;
            headingRef.current.focus();
        }
    }, [site]);

    return (
        <div className="detail">
            <nav aria-label="Breadcrumb">
                <Link to="/" className="link-target">← All sites</Link>
            </nav>

            {error && <p className="error-banner" role="alert">{error}</p>}

            {loading ? (
                <p>Loading…</p>
            ) : site === null && !error ? (
                <>
                    <h1>Site not found</h1>
                    <p>It may have been deleted. Go back to all sites to see what's monitored.</p>
                </>
            ) : (
                <>
                    <h1 ref={headingRef} tabIndex={-1}>{site.url}</h1>

                    <dl className="facts">
                        <dt>Status</dt>
                        <dd>{site.status}</dd>

                        {site.error && (
                            <>
                                <dt>Latest problem</dt>
                                <dd>{site.error}</dd>
                            </>
                        )}

                        <dt>Uptime</dt>
                        <dd>{site.uptime === null ? "not checked yet" : `${site.uptime}%`}</dd>

                        <dt>Average response</dt>
                        <dd>{site.avg_ms === null ? "not checked yet" : `${site.avg_ms} ms`}</dd>
                    </dl>
                </>
            )}
        </div>
    );
}

export default SiteDetail;
