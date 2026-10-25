async function loadSites() {
    const response = await fetch("/api/sites");
    const sites = await response.json()

    const container = document.getElementById("sites");
    container.innerHTML = "";

    for (const site of sites) {
        const card = document.createElement("div");
        card.className = `card ${site.status}`;

        let avgText;
        if (site.avg_ms === null) {
            avgText = "n/a";
        } else {
            avgText = `${site.avg_ms} ms`;
        }

        let uptimeText;
        if (site.uptime === null) {
            uptimeText = "n/a";
        } else {
            uptimeText = `${site.uptime}%`;
        }

        card.innerHTML = `
           <h2><span>${site.url}</span></h2>
           <p>Status: ${site.status}</p>
           <p>Uptime: ${uptimeText}</p>
           <p>Avg response time: ${avgText}</p>
           `;

        container.appendChild(card);
    }

    document.getElementById("updated").textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

}

loadSites();
setInterval(loadSites, 30000);