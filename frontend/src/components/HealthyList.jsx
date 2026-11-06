import { Link } from "react-router";
import DeleteSiteButton from "./DeleteSiteButton"

function HealthyList({ sites, isAdmin, onDeleted }) {
    return (
        <section className="panel" aria-labelledby="healthy-heading">
            <h2 id="healthy-heading">Healthy ({sites.length})</h2>
            <ul className="healthy-list">
                {sites.map((site) => (
                    <li key={site.id}>
                        <span className="site">
                            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
                                strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12l5 5L19 7" />
                            </svg>
                            {site.url}
                            <span className="sr-only"> is up</span>
                        </span>
                        <span className="ms">{site.avg_ms} ms</span>
                        <div className="card-actions">
                            <Link to={`/sites/${site.id}`} className="link-target">
                                Details<span className="sr-only"> for {site.url}</span>
                            </Link>
                            {isAdmin && <DeleteSiteButton site={site} onDeleted={onDeleted} />}
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}

export default HealthyList