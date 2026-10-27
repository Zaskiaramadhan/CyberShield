/* =========================================================
   TASK 03 - ONE COMPLETE INTERACTION
   "I already clicked it. What now?"

   Click a situation button  ->  click event
   -> JavaScript reads the matching data
   -> incident detail and steps appear on the page
   ========================================================= */

const incidents = {
    link: {
        severity: "Medium",
        title: "You clicked a suspicious link",
        summary: "Clicking alone is often harmless, but some pages try to install something or trick you into typing details. Act quickly and check what happened.",
        steps: [
            "Close the page or tab right away. Do not type anything into it.",
            "If you typed a password, change it now on the real website by typing the address yourself.",
            "Change the same password on every other account where you used it.",
            "Turn on two-factor authentication for your important accounts.",
            "Run a full security scan on your phone or computer."
        ]
    },
    install: {
        severity: "High",
        title: "You installed an unknown .apk or .exe",
        summary: "Unknown apps and programs can spy on you, read your messages or lock your files. Treat the device as compromised until it is cleaned.",
        steps: [
            "Turn off Wi-Fi and mobile data so the app cannot send anything out.",
            "Uninstall the app (Android: Settings > Apps) or delete the program, then run a full antivirus scan.",
            "From a different, clean device, change the passwords for your email and banking accounts.",
            "Check your bank and e-wallet apps for payments you do not recognise.",
            "If problems continue, back up your photos and documents, then reset the device to factory settings."
        ]
    },
    password: {
        severity: "High",
        title: "You typed your password on a fake page",
        summary: "The attacker now has your password and may already be trying it on other sites. Speed matters here.",
        steps: [
            "Go to the real website by typing its address, then change your password immediately.",
            "Change the same password anywhere else you used it.",
            "Sign out of all devices and sessions in the account settings.",
            "Turn on two-factor authentication.",
            "Check that your recovery email and phone number were not changed."
        ]
    },
    money: {
        severity: "Critical",
        title: "You sent money or card details",
        summary: "Money can sometimes be stopped if you act within the first hours. Do not feel embarrassed. Scammers are professionals.",
        steps: [
            "Call your bank or e-wallet provider now and ask them to block the card or stop the transfer.",
            "Save screenshots, receipts, phone numbers and account names as evidence.",
            "Report the scam to the platform where it happened and to your local police cyber crime unit.",
            "Ignore anyone offering to recover your money for a fee. That is a second scam.",
            "Warn family and friends, because the scammer may contact them next."
        ]
    }
};

const SEVERITY_BG = { Medium: "bg-amber-700", High: "bg-orange-700", Critical: "bg-red-700" };

const incidentButtons = document.querySelectorAll(".incident-btn");
const incidentEmpty = document.querySelector("#incident-empty");
const incidentDetail = document.querySelector("#incident-detail");
const incidentSeverity = document.querySelector("#incident-severity");
const incidentTitle = document.querySelector("#incident-title");
const incidentSummary = document.querySelector("#incident-summary");
const incidentSteps = document.querySelector("#incident-steps");
const incidentProgress = document.querySelector("#incident-progress");

function updateProgress() {
    const boxes = incidentSteps.querySelectorAll("input");
    let done = 0;

    boxes.forEach(function (box) {
        box.closest("li").dataset.done = box.checked;
        if (box.checked) {
            done++;
        }
    });

    if (done === boxes.length) {
        incidentProgress.textContent = "All steps done. Keep watching your accounts for the next few weeks.";
        setTone(incidentProgress, "good");
    } else {
        incidentProgress.textContent = done + " of " + boxes.length + " steps done.";
        setTone(incidentProgress, "warn");
    }
}

function showIncident(key) {
    const data = incidents[key];
    if (!data) {
        return;   // safety: unknown key does nothing and cannot break the page
    }

    // 1. mark the chosen button
    incidentButtons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.dataset.incident === key);
    });

    // 2. fill the detail panel with the data
    incidentSeverity.textContent = data.severity + " risk";
    incidentSeverity.className = "mb-2.5 inline-block rounded-full px-3 py-[3px] text-[13px] font-bold text-white " + SEVERITY_BG[data.severity];
    incidentTitle.textContent = data.title;
    incidentSummary.textContent = data.summary;

    incidentSteps.textContent = "";
    data.steps.forEach(function (text) {
        const li = document.createElement("li");
        const label = document.createElement("label");
        const box = document.createElement("input");
        const span = document.createElement("span");

        li.className = "group mb-2.5 rounded-lg bg-white data-[done=true]:bg-green-100";
        label.className = "flex cursor-pointer items-start gap-3 px-[15px] py-3";
        box.type = "checkbox";
        box.className = "mt-1.5";
        box.addEventListener("change", updateProgress);
        span.className = "group-data-[done=true]:text-slate-600 group-data-[done=true]:line-through";
        span.textContent = text;

        label.appendChild(box);
        label.appendChild(span);
        li.appendChild(label);
        incidentSteps.appendChild(li);
    });

    // 3. show the result
    incidentEmpty.hidden = true;
    incidentDetail.hidden = false;
    updateProgress();
}

incidentButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
        showIncident(btn.dataset.incident);
    });
});
