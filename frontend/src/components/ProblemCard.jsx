import DeleteSiteButton from "./DeleteSiteButton";

const ICONS = {
    down: "M12 8v5 M12 16.5v.5 M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    pending: "M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
};

function ProblemCard({ site, isAdmin, onDeleted }) {
    const isDown = site.status === "down";
    const label = isDown ? "Down" : "Waiting for first check";
    const uptimeText = site.uptime === null ? "not checked yet" : `${site.uptime}%`;
    const chipClass = isDown ? "chip chip--down" : "chip chip--info";

    return (
        <article className="problem-card" aria-labelledby={`site-${site.id}`}>
            <span className={chipClass}>
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
                    strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[site.status]} />
                </svg>
                {label}
            </span>

            <h2 id={`site-${site.id}`}>{site.url}</h2>
            {site.error && <p className="reason">{site.error}</p>}
            <p className="meta">Uptime: {uptimeText}</p>
            {isAdmin && (
                <div className="card-actions"><DeleteSiteButton site={site} onDeleted={onDeleted} /></div>
            )}
        </article>
    )
}

export default ProblemCard;