/* =========================================================
   SPRINT 03 - CONNECT CYBERSHIELD TO AN API
   Flow: User click -> fetch() request -> response -> JSON
         -> JavaScript array of objects -> DOM (cards)

   Task 01  Connect to API ........ fetch(BREACH_API)
   Task 02  Display API data ...... renderBreaches()
   Task 03  Handle API state ...... loading / success / error
   ========================================================= */

// Local sample API response; no API key is required for the practice project.
const BREACH_API = "Breaches.JSON";
// A URL that always answers 404, used only to practise error handling
const BROKEN_API = "https://jsonplaceholder.typicode.com/posts/99999";
// How many breaches we show on the page
const BREACH_LIMIT = 6;

const breachLoadBtn = document.querySelector("#breach-load");
const breachFailBtn = document.querySelector("#breach-fail");
const breachRetryBtn = document.querySelector("#breach-retry");
const breachStatus = document.querySelector("#breach-status");
const breachStatusText = document.querySelector("#breach-status-text");
const breachSpinner = document.querySelector("#breach-spinner");
const breachError = document.querySelector("#breach-error");
const breachErrorText = document.querySelector("#breach-error-text");
const breachList = document.querySelector("#breach-list");
const flowItems = document.querySelectorAll("#flow li");

let lastBreachUrl = BREACH_API;   // remembered so "Try again" repeats the same request


/* ---------- Demo: data flow indicator ----------
   Steps before `current` become "done", the `current` step gets `state`
   ("active" or "error"), steps after it are cleared.
   Tailwind colours them with data-[state=...] variants. */
function setFlow(current, state) {
    flowItems.forEach(function (item, i) {
        if (i < current) {
            item.dataset.state = "done";
        } else if (i === current) {
            item.dataset.state = state;
        } else {
            delete item.dataset.state;
        }
    });
}


/* ---------- helpers for turning API data into text ---------- */

// The API sends the description as HTML. DOMParser reads it WITHOUT running
// anything, then textContent gives us plain, safe text.
function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
}

function shorten(text, max) {
    return text.length > max ? text.slice(0, max).trim() + "..." : text;
}


/* ---------- Task 02: render array of objects to the DOM ---------- */
function renderBreaches(breaches) {
    breachList.textContent = "";

    breaches.forEach(function (b) {
        const card = document.createElement("article");
        const date = document.createElement("span");
        const title = document.createElement("h3");
        const count = document.createElement("p");
        const desc = document.createElement("p");
        const types = document.createElement("p");

        card.className = "flex flex-col rounded-xl bg-white p-5 shadow-md";

        date.className = "mb-2.5 inline-block self-start rounded-full bg-sky-100 px-2.5 py-[3px] text-[13px] font-bold text-sky-700";
        date.textContent = "Breach date: " + (b.breachDate || b.BreachDate || "unknown");

        title.className = "card-title";
        title.textContent = b.title || b.Title || b.Name || "Unknown breach";

        count.className = "mb-2 font-bold text-red-700";
        const exposed = Number(b.accountsExposed ?? b.PwnCount);
        count.textContent = Number.isFinite(exposed)
            ? exposed.toLocaleString("en-US") + " accounts exposed"
            : "Unknown number of accounts exposed";

        desc.className = "mb-3 text-sm text-slate-700";
        desc.textContent = shorten(stripHtml(b.description || b.Description), 160);

        types.className = "mt-auto text-sm text-slate-500";
        const leaked = b.dataLeaked || b.DataClasses;
        types.textContent = "Data leaked: " + (Array.isArray(leaked) ? leaked.slice(0, 4).join(", ") : "Unknown");

        card.append(date, title, count, desc, types);

        // connect this feature to the Password section
        if (Array.isArray(leaked) && leaked.includes("Passwords")) {
            const tip = document.createElement("p");
            tip.className = "mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-bold text-red-700";
            tip.textContent = "Passwords were leaked. This is why you need a unique password for every site.";
            card.appendChild(tip);
        }

        breachList.appendChild(card);
    });
}


/* ---------- Task 01 + 03: request, loading, success, error ---------- */
async function loadBreaches(url) {
    lastBreachUrl = url;
    let step = 0;   // which step of the flow we are on (for the error colour)

    // LOADING state
    breachLoadBtn.disabled = true;
    breachFailBtn.disabled = true;
    breachRetryBtn.disabled = true;
    breachError.hidden = true;
    breachSpinner.classList.remove("hidden");
    breachStatus.setAttribute("aria-busy", "true");
    breachList.textContent = "";
    setTone(breachStatus, "warn");
    breachStatusText.textContent = "Fetching data from the API...";
    setFlow(0, "active");

    try {
        // 1. REQUEST: send it and wait for the server
        // cache: "no-store" tells the browser NOT to reuse an old saved copy,
        // so a real network failure is not hidden by the browser cache
        const response = await fetch(url, { cache: "no-store" });

        // 2. RESPONSE: fetch() does NOT throw on 404/500, so we check ourselves
        step = 1;
        setFlow(1, "active");
        if (!response.ok) {
            throw new Error("The server answered with status " + response.status + ".");
        }

        // 3. JSON: turn the text into a JavaScript array of objects
        step = 2;
        setFlow(2, "active");
        const payload = await response.json();
        const data = Array.isArray(payload) ? payload : payload && payload.data;
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("The API returned no data.");
        }

        // 4. DISPLAY: newest breaches first, keep only a few, draw cards
        step = 3;
        setFlow(3, "active");
        const latest = data
            .slice()
            .sort(function (a, b) {
                const dateA = Date.parse(a.addedDate || a.AddedDate || a.breachDate || a.BreachDate || "");
                const dateB = Date.parse(b.addedDate || b.AddedDate || b.breachDate || b.BreachDate || "");
                return (Number.isFinite(dateB) ? dateB : 0) - (Number.isFinite(dateA) ? dateA : 0);
            })
            .slice(0, BREACH_LIMIT);
        renderBreaches(latest);

        // SUCCESS state
        setFlow(4, "done");
        setTone(breachStatus, "good");
        breachStatusText.textContent = "Loaded " + latest.length + " of " + data.length + " known breaches.";
    } catch (error) {
        // ERROR state
        setFlow(step, "error");
        setTone(breachStatus, "bad");
        breachStatusText.textContent = "Could not load the data.";

        // fetch() rejects with a TypeError when the network or CORS blocks it
        breachErrorText.textContent = error instanceof TypeError
            ? "Could not reach the server. Check your internet connection and try again."
            : error instanceof SyntaxError
                ? "The server returned invalid JSON. Try again later."
                : error instanceof Error
                    ? error.message
                    : "An unexpected error occurred. Try again.";
        breachError.hidden = false;
        console.error(error);
    } finally {
        breachLoadBtn.disabled = false;
        breachFailBtn.disabled = false;
        breachRetryBtn.disabled = false;
        breachSpinner.classList.add("hidden");
        breachStatus.setAttribute("aria-busy", "false");
    }
}

breachLoadBtn.addEventListener("click", function () { loadBreaches(BREACH_API); });
breachFailBtn.addEventListener("click", function () { loadBreaches(BROKEN_API); });
breachRetryBtn.addEventListener("click", function () { loadBreaches(lastBreachUrl); });
loadBreaches(BREACH_API);
