import { useEffect, useState } from "react"

function SiteList() {
    const [sites, setSites] = useState([]);

    useEffect(() => {
        async function load() {
            const response = await fetch("/api/sites");
            const data = await response.json();
            setSites(data);
        }
        load();
    }, []);

    return (
        <ul>
            {sites.map((site) => (
                <li key={site.id}>
                    {site.url}: {site.status}
                    {site.error && <p>{site.error}</p>}
                </li>
            ))}
        </ul>
    )
}

export default SiteList