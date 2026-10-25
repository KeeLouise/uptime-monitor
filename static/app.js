async function loadSites() {
    const response = await fetch("/api/sites");
    const sites = await response.json()

    const container = document.getElementById("sites");

    for (const site of sites) {
        const card = document.createElement("div");
        card.className = `card ${site.status}`;

        card.innerHTML = `
           <h2><span>${site.url}</span></h2>
           <p>Status: ${site.status}</p>
           <p>Uptime: ${site.uptime}%</p>
           <p>Avg response time: ${site.avg_ms} ms</p>
           `;
        
           container.appendChild(card);
    }
}

loadSites();