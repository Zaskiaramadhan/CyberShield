/* =========================================================
   FEATURE 1 - FILE & LINK AUTHENTICITY CHECKLIST
   ========================================================= */

const scanInput = document.querySelector("#scan-input");
const scanBtn = document.querySelector("#scan-btn");
const scanResult = document.querySelector("#scan-result");
const scanVerdict = document.querySelector("#scan-verdict");
const scanFindings = document.querySelector("#scan-findings");

const DANGEROUS_EXT = {
    exe: "an executable program that can run malware",
    scr: "a screensaver file, often used to hide malware",
    bat: "a script that can run harmful commands",
    cmd: "a script that can run harmful commands",
    msi: "an installer that can install malware",
    vbs: "a script that can run harmful commands",
    js: "a script file that can run code",
    jar: "a Java program that can run malware",
    ps1: "a PowerShell script that can run harmful commands",
    pif: "an old executable format used by malware",
    apk: "an Android app file. Installing it outside Google Play is a common way phones get infected"
};
const DOC_EXT = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "txt", "mp3", "mp4"];
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly", "rebrand.ly", "s.id", "shorturl.at"];
const RISKY_TLDS = ["xyz", "top", "tk", "click", "zip", "gq", "ml", "cf", "work", "loan"];
const OFFICIAL = {
    paypal: "paypal.com",
    google: "google.com",
    facebook: "facebook.com",
    instagram: "instagram.com",
    whatsapp: "whatsapp.com",
    shopee: "shopee.co.id",
    tokopedia: "tokopedia.com",
    klikbca: "bca.co.id",
    mandiri: "bankmandiri.co.id",
    gopay: "gopay.co.id"
};
const BAIT_WORDS = ["login", "verify", "secure", "update", "account", "free", "gift", "prize", "claim", "confirm"];

function analyze(text) {
    const value = text.trim().toLowerCase();
    const findings = [];
    let risk = 0;

    // ---- file name / extension (works for a plain file name or the end of a link)
    const path = value.split(/[?#]/)[0];
    const lastPart = path.split("/").pop();
    const pieces = lastPart.split(".");
    const ext = pieces.length > 1 ? pieces[pieces.length - 1] : "";

    if (DANGEROUS_EXT[ext]) {
        risk += 3;
        findings.push("The file type ." + ext + " is " + DANGEROUS_EXT[ext] + ".");
    }
    if (pieces.length > 2 && DOC_EXT.includes(pieces[pieces.length - 2]) && DANGEROUS_EXT[ext]) {
        risk += 3;
        findings.push("Double extension (." + pieces[pieces.length - 2] + "." + ext + "): it pretends to be a document but is really a program.");
    }

    // ---- link checks
    const looksLikeLink = value.includes("://") || value.startsWith("www.") || value.includes("/") ||
        (value.includes(".") && !DANGEROUS_EXT[ext] && !DOC_EXT.includes(ext));

    if (looksLikeLink) {
        let url = null;
        try {
            url = new URL(value.includes("://") ? value : "http://" + value);
        } catch (e) {
            findings.push("This does not look like a valid link.");
            risk += 1;
        }

        if (url) {
            const host = url.hostname;
            const parts = host.split(".");
            const tld = parts[parts.length - 1];

            if (url.protocol !== "https:") {
                risk += 1;
                findings.push("The link does not use https, so the connection is not encrypted.");
            }
            if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
                risk += 3;
                findings.push("The link uses a raw IP address instead of a domain name.");
            }
            if (SHORTENERS.includes(host)) {
                risk += 2;
                findings.push("A shortened link hides the real destination.");
            }
            if (value.includes("@")) {
                risk += 2;
                findings.push("The @ symbol can hide the real destination of a link.");
            }
            if (host.includes("xn--")) {
                risk += 3;
                findings.push("The domain uses look-alike characters (punycode).");
            }
            if (RISKY_TLDS.includes(tld)) {
                risk += 1;
                findings.push("The ending ." + tld + " is often used by scam sites.");
            }
            if (parts.length > 4 || (host.match(/-/g) || []).length >= 3) {
                risk += 1;
                findings.push("The domain has many subdomains or hyphens, which is typical of fake sites.");
            }

            const baitFound = BAIT_WORDS.filter(function (w) { return host.includes(w); });
            if (baitFound.length > 0) {
                risk += 1;
                findings.push("The domain contains bait words: " + baitFound.join(", ") + ".");
            }

            for (const brand in OFFICIAL) {
                const official = OFFICIAL[brand];
                const isOfficial = host === official || host.endsWith("." + official);
                if (host.includes(brand) && !isOfficial) {
                    risk += 3;
                    findings.push("The domain mentions \"" + brand + "\" but is not the official site (" + official + ").");
                    break;
                }
            }
        }
    }

    return { risk: risk, findings: findings };
}

scanBtn.addEventListener("click", function () {
    const text = scanInput.value.trim();

    scanResult.hidden = false;
    delete scanResult.dataset.state;
    scanFindings.textContent = "";

    if (text === "") {
        scanVerdict.textContent = "Please paste a link or type a file name first.";
        setTone(scanVerdict, null);
        return;
    }

    const result = analyze(text);

    if (result.risk >= 3) {
        scanVerdict.textContent = "Dangerous. Do not open or install this.";
        setTone(scanVerdict, "bad");
        scanResult.dataset.state = "danger";
    } else if (result.risk >= 1) {
        scanVerdict.textContent = "Suspicious. Verify it before you continue.";
        setTone(scanVerdict, "warn");
        scanResult.dataset.state = "risky";
    } else {
        scanVerdict.textContent = "No obvious warning signs found.";
        setTone(scanVerdict, "good");
        scanResult.dataset.state = "safe";
        result.findings.push("This is not a guarantee. Finish the checklist below and confirm with the sender.");
    }

    result.findings.forEach(function (f) {
        const li = document.createElement("li");
        li.textContent = f;
        scanFindings.appendChild(li);
    });
});

scanInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        scanBtn.click();
    }
});


/* ---------- Manual checklist ----------
   data-expect="yes": a safe sign, it SHOULD be ticked if it is true
   data-expect="no" : a red flag, it should NOT be ticked unless it is true
*/
const checkBtn = document.querySelector("#check-btn");
const checklistResult = document.querySelector("#checklist-result");
const checkItems = document.querySelectorAll(".check-item");

checkBtn.addEventListener("click", function () {
    let redFlags = 0;      // red flags the user ticked
    let missingSigns = 0;  // safe signs the user did NOT tick

    checkItems.forEach(function (item) {
        const isSafeSign = item.dataset.expect === "yes";
        const li = item.closest("li");

        if (isSafeSign && !item.checked) {
            missingSigns++;
            li.dataset.state = "off";
        } else if (!isSafeSign && item.checked) {
            redFlags++;
            li.dataset.state = "off";
        } else {
            li.dataset.state = "ok";
        }
    });

    if (redFlags >= 2) {
        checklistResult.textContent = "Dangerous: " + redFlags + " red flags found. Do not open this file or link.";
        setTone(checklistResult, "bad");
    } else if (redFlags === 1) {
        checklistResult.textContent = "Suspicious: 1 red flag found. Do not open it until you confirm with the sender in another way.";
        setTone(checklistResult, "warn");
    } else if (missingSigns > 0) {
        checklistResult.textContent = "No red flags, but " + missingSigns + " safe sign(s) are missing. Verify them before you open it.";
        setTone(checklistResult, "warn");
    } else {
        checklistResult.textContent = "No red flags and all safe signs are present. This looks safe to open.";
        setTone(checklistResult, "good");
    }
});

// clear the colour marks when the user changes an answer
checkItems.forEach(function (item) {
    item.addEventListener("change", function () {
        delete item.closest("li").dataset.state;
    });
});
