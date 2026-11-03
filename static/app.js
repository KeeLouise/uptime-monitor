async function loadSites() {
    const response = await fetch("/api/sites");
    if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
    }
    const sites = await response.json();

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
            if (check.status_code !== null && check.status_code < 400) {
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
        }).join("");

        card.innerHTML = `
           <h2><span></span><button class="close" title="Delete site">×</button></h2>
           <p>Status: ${site.status}</p>
           <p>Uptime: ${uptimeText}</p>
           <p>Avg response time: ${avgText}</p>
           <div class="history">${historyHtml}</div>
           <div class="chart">${chartHtml}</div>
           `;
        container.appendChild(card);
        card.querySelector("h2 span").textContent = site.url;


        const closeButton = card.querySelector(".close");

        closeButton.addEventListener("click", async function () {
            if (!confirm(`Delete ${site.url}? Its history will be lost.`)) {
                return;
            }

            await fetch(`/api/sites/${site.id}`, { method: "DELETE"});

            refresh();

        })
    }

    document.getElementById("updated").textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

}

async function refresh() {
    try {
        await loadSites();
    } catch (error) {
        document.getElementById("updated").textContent = "⚠ Can't reach the server. Retrying in 30 seconds…";
    }
}

const form = document.getElementById("add-form");
const urlInput = document.getElementById("url-input");
const message = document.getElementById("form-message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let response;
    try {
        response = await fetch("/api/sites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlInput.value })
        });
    } catch (error) {
        message.textContent = "Couldn't reach the server. Is it running?";
        message.className = "error";
        return;
    }

    if (response.ok) {
        message.textContent = "Site added!";
        message.className = "";
        urlInput.value = "";
        refresh();
    } else {
        const data = await response.json();
        message.textContent = data.error;
        message.className = "error";
    }
});

refresh();
setInterval(refresh, 30000);
