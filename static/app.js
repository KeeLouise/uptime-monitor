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

        //fetch the site's checks
        const checksResponse = await fetch(`/api/sites/${site.id}/checks`);
        const checks = await checksResponse.json()
        checks.reverse()

        const historyHtml = checks.map((check) => {
            if(check.status_code !== null && check.status_code < 400){
                return `<span class="up"></span>`;
            } else {
                return `<span class ="down"></span>`
            }

        }).join("");

        const times = checks
            .map((check) => check.response_ms)
            .filter((ms) => ms !== null);
        
        const slowest = Math.max(...times)

        const chartHtml = times.map((ms) => {
            const height = Math.round(ms / slowest * 100);
            return `<span style="height: ${height}%" title="${ms} ms"></span>`;
        })

        card.innerHTML = `
           <h2><span>${site.url}</span></h2>
           <p>Status: ${site.status}</p>
           <p>Uptime: ${uptimeText}</p>
           <p>Avg response time: ${avgText}</p>
           <div class="history">${historyHtml}</div>
           <div class="chart">${chartHtml}</div>
           `;

        container.appendChild(card);
    }

    document.getElementById("updated").textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

}

const form = document.getElementById("add-form");
const urlInput = document.getElementById("url-input");
const message = document.getElementById("form-message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const response = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.value })
    });

    if (response.ok) {
        message.textContent = "Site added!";
        message.className = "";
        urlInput.value = "";
        loadSites();
    } else {
        const data = await response.json();
        message.textContent = data.error;
        message.className = "error";
    }
});

loadSites();
setInterval(loadSites, 30000);