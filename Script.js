/* =========================================================
   CyberShield - select an element with querySelector(),
   then change it (textContent, dataset, classList, hidden...)

   Styling is done with Tailwind CSS. JavaScript only:
   - adds/removes Tailwind colour classes (setTone)
   - sets data-* attributes such as data-state="hacked",
     which Tailwind styles with data-[state=hacked]:... variants
   ========================================================= */

/* ---------- helper: text colour by tone ---------- */
const TONES = {
    good: "text-green-700",
    warn: "text-amber-700",
    bad: "text-red-700"
};

function setTone(el, tone) {
    Object.values(TONES).forEach(function (c) { el.classList.remove(c); });
    if (tone) {
        el.classList.add(TONES[tone]);
    }
}


/* ---------- HOME ---------- */
const title = document.querySelector("#title");
const subtitle = document.querySelector("#home p");

const hour = new Date().getHours();
let greeting = "Good evening";
if (hour < 12) {
    greeting = "Good morning";
} else if (hour < 18) {
    greeting = "Good afternoon";
}
title.textContent = greeting + "! Stay Safe in the Digital World";
subtitle.textContent = "Check links and files, spot scams, and stop reusing passwords.";

const footerText = document.querySelector("#footer-text");
footerText.textContent = "© " + new Date().getFullYear() + " CyberShield";


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


/* =========================================================
   FEATURE 2 - SOCIAL ENGINEERING EXPLAINER
   ========================================================= */

const playButtons = document.querySelectorAll(".play-btn");

playButtons.forEach(function (btn) {
    let timers = [];

    btn.addEventListener("click", function () {
        const card = btn.closest(".attack-card");
        const steps = card.querySelectorAll("ol li");
        const redflag = card.querySelector(".redflag");

        // reset any earlier run
        timers.forEach(clearTimeout);
        timers = [];
        steps.forEach(function (s) { delete s.dataset.show; });
        redflag.hidden = true;
        btn.textContent = "Playing...";
        btn.disabled = true;

        steps.forEach(function (step, i) {
            timers.push(setTimeout(function () {
                step.dataset.show = "true";
            }, 300 + i * 900));
        });

        timers.push(setTimeout(function () {
            redflag.hidden = false;
            btn.textContent = "Replay";
            btn.disabled = false;
        }, 300 + steps.length * 900));
    });
});


/* =========================================================
   FEATURE 3 - PASSWORD MANAGER EDUCATION (4 interactive steps)
   ========================================================= */

(function () {

    /* ---------- shared: random password ---------- */
    function randomPassword(length, useSymbols) {
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        if (useSymbols) {
            chars += "!@#$%^&*-_?";
        }
        const random = new Uint32Array(length);
        crypto.getRandomValues(random);

        let result = "";
        random.forEach(function (n) {
            result += chars[n % chars.length];
        });
        return result;
    }

    const ACCOUNTS = ["Email", "Social media", "Online shop", "Banking", "Cloud storage"];


    /* ---------- STEP 1: credential stuffing demo ---------- */
    const SAME_PASSWORD = "Budi2005!";
    const UNIQUE_PASSWORDS = ["vT7#mK2qLp9$", "n4Wx!8sRj3@z", "Qe6&hY1dBc5%", "u9Pz$4LfGt2!", "Hk3@wM7xVa8#"];

    const accountList = document.querySelector("#account-list");
    const breachLog = document.querySelector("#breach-log");
    const modeButtons = document.querySelectorAll(".mode-btn");

    let mode = "same";
    let busy = false;
    let timers = [];

    function passwordOf(i) {
        return mode === "same" ? SAME_PASSWORD : UNIQUE_PASSWORDS[i];
    }

    const accountCards = document.querySelectorAll("#account-list .acct");

    function renderAccounts() {
        timers.forEach(clearTimeout);
        timers = [];
        busy = false;
        breachLog.textContent = "";
        setTone(breachLog, null);

        accountCards.forEach(function (card, i) {
            delete card.dataset.state;
            card.querySelector(".acct-pass").textContent = passwordOf(i);
            card.querySelector(".acct-status").textContent = "Click to hack";
        });
    }

    accountCards.forEach(function (card, i) {
        card.addEventListener("click", function () { attack(i); });
    });

    function setState(btn, state, text) {
        btn.dataset.state = state;
        btn.querySelector(".acct-status").textContent = text;
    }

    function attack(index) {
        if (busy) {
            return;
        }
        const cards = accountCards;
        const leaked = passwordOf(index);
        let lost = 1;
        let delay = 0;

        busy = true;
        setTone(breachLog, "warn");
        breachLog.textContent = ACCOUNTS[index] + " was hacked. The attacker now knows the password \"" + leaked + "\" and tries it on your other accounts...";
        setState(cards[index], "hacked", "Hacked");

        cards.forEach(function (card, i) {
            if (i === index) {
                return;
            }
            delay += 700;
            timers.push(setTimeout(function () {
                if (passwordOf(i) === leaked) {
                    setState(card, "hacked", "Hacked");
                    lost++;
                } else {
                    setState(card, "blocked", "Password rejected");
                }
            }, delay));
        });

        timers.push(setTimeout(function () {
            busy = false;
            if (lost === ACCOUNTS.length) {
                setTone(breachLog, "bad");
                breachLog.textContent = "Accounts lost: " + lost + " of " + ACCOUNTS.length + ". One leak opened every door, including your bank.";
            } else {
                setTone(breachLog, "good");
                breachLog.textContent = "Accounts lost: " + lost + " of " + ACCOUNTS.length + ". Unique passwords kept the damage to one site.";
            }
        }, delay + 500));
    }

    modeButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            mode = btn.dataset.mode;
            modeButtons.forEach(function (b) {
                b.setAttribute("aria-pressed", b === btn);
            });
            renderAccounts();
        });
    });

    renderAccounts();


    /* ---------- STEP 2: mini password manager ---------- */
    const masterInput = document.querySelector("#master-input");
    const masterHint = document.querySelector("#master-hint");
    const unlockBtn = document.querySelector("#unlock-btn");
    const vaultLock = document.querySelector("#vault-lock");
    const vault = document.querySelector("#vault");
    const vaultList = document.querySelector("#vault-list");
    const vaultProgress = document.querySelector("#vault-progress");

    masterInput.addEventListener("input", function () {
        const len = masterInput.value.length;
        setTone(masterHint, len >= 12 ? "good" : null);
        masterHint.textContent = len === 0 ? "" : len >= 12 ? "Good length. Long passphrases are easy to remember and hard to crack." : len + " / 12 characters";
    });

    function updateVaultProgress() {
        const rows = vaultList.querySelectorAll("li");
        let done = 0;
        rows.forEach(function (row) {
            if (row.dataset.done === "true") {
                done++;
            }
        });
        setTone(vaultProgress, done === rows.length ? "good" : "warn");
        vaultProgress.textContent = done === rows.length
            ? "All " + done + " accounts have a unique password. Go back to Step 1, choose \"Unique password for each\" and hack a site again."
            : done + " of " + rows.length + " accounts protected with a unique password.";
    }

    function buildVault() {
        vaultList.textContent = "";
        ACCOUNTS.forEach(function (name) {
            const li = document.createElement("li");
            const label = document.createElement("span");
            const code = document.createElement("code");
            const gen = document.createElement("button");
            const eye = document.createElement("button");
            let secret = "";
            let visible = false;

            li.className = "mb-2 flex flex-wrap items-center gap-2.5 rounded-lg bg-slate-100 px-3.5 py-2.5 data-[done=true]:bg-green-100";
            label.className = "min-w-[110px] flex-1 font-bold";
            label.textContent = name;
            code.className = "min-w-[160px] flex-[2] break-all";
            code.textContent = "(empty)";
            gen.className = "btn px-3 py-1.5 text-sm";
            gen.textContent = "Generate";
            eye.className = "btn px-3 py-1.5 text-sm";
            eye.textContent = "Show";
            eye.hidden = true;

            function paint() {
                code.textContent = visible ? secret : "\u2022".repeat(secret.length);
                eye.textContent = visible ? "Hide" : "Show";
            }

            gen.addEventListener("click", function () {
                secret = randomPassword(16, true);
                visible = false;
                eye.hidden = false;
                gen.textContent = "Regenerate";
                li.dataset.done = "true";
                paint();
                updateVaultProgress();
            });

            eye.addEventListener("click", function () {
                visible = !visible;
                paint();
            });

            li.append(label, code, gen, eye);
            vaultList.appendChild(li);
        });
        updateVaultProgress();
    }

    unlockBtn.addEventListener("click", function () {
        if (masterInput.value.length < 12) {
            setTone(masterHint, "bad");
            masterHint.textContent = "Your master password needs at least 12 characters. It protects everything.";
            return;
        }
        masterInput.value = "";   // the demo never keeps it
        vaultLock.hidden = true;
        vault.hidden = false;
        buildVault();
    });


    /* ---------- STEP 3: Myth or Fact ---------- */
    const QUIZ = [
        { text: "If my password is long and complex, I can safely use it on every site.", answer: "myth",
          why: "Myth. If any one site leaks it, attackers try it everywhere else." },
        { text: "A password manager can create passwords I would never be able to remember.", answer: "fact",
          why: "Fact. That is the point: the manager remembers, you don't have to." },
        { text: "Adding a number at the end (Pass1, Pass2, Pass3) makes each password unique enough.", answer: "myth",
          why: "Myth. Attackers know this pattern and try it automatically." },
        { text: "My password manager needs a strong master password and two-factor authentication.", answer: "fact",
          why: "Fact. The vault is only as safe as the key that opens it." }
    ];

    const quizProgress = document.querySelector("#quiz-progress");
    const quizStatement = document.querySelector("#quiz-statement");
    const quizAnswers = document.querySelector("#quiz-answers");
    const quizButtons = document.querySelectorAll(".quiz-btn");
    const quizFeedback = document.querySelector("#quiz-feedback");
    const quizNext = document.querySelector("#quiz-next");

    let qIndex = 0;
    let score = 0;

    function showQuestion() {
        const q = QUIZ[qIndex];
        quizProgress.textContent = "Question " + (qIndex + 1) + " of " + QUIZ.length;
        quizStatement.textContent = q.text;
        quizFeedback.textContent = "";
        setTone(quizFeedback, null);
        quizAnswers.hidden = false;
        quizButtons.forEach(function (b) { b.disabled = false; });
        quizNext.hidden = true;
    }

    quizButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
            const q = QUIZ[qIndex];
            const correct = btn.dataset.answer === q.answer;
            if (correct) {
                score++;
            }
            setTone(quizFeedback, correct ? "good" : "bad");
            quizFeedback.textContent = (correct ? "Correct! " : "Not quite. ") + q.why;
            quizButtons.forEach(function (b) { b.disabled = true; });
            quizNext.textContent = qIndex === QUIZ.length - 1 ? "See my score" : "Next";
            quizNext.hidden = false;
        });
    });

    quizNext.addEventListener("click", function () {
        if (quizNext.textContent === "Play again") {
            qIndex = 0;
            score = 0;
            showQuestion();
        } else if (qIndex < QUIZ.length - 1) {
            qIndex++;
            showQuestion();
        } else {
            quizProgress.textContent = "Finished";
            quizStatement.textContent = "You scored " + score + " out of " + QUIZ.length + ".";
            setTone(quizFeedback, null);
            quizFeedback.textContent = score === QUIZ.length ? "Perfect. You understand why one password is never enough." : "Review the explanations above and try again.";
            quizAnswers.hidden = true;
            quizNext.textContent = "Play again";
        }
    });

    showQuestion();


    /* ---------- STEP 4: strength tester + generator ---------- */
    const passwordInput = document.querySelector("#password-input");
    const strengthText = document.querySelector("#strength-text");

    function formatTime(seconds) {
        if (seconds < 1) return "instantly";
        if (seconds < 60) return Math.round(seconds) + " seconds";
        if (seconds < 3600) return Math.round(seconds / 60) + " minutes";
        if (seconds < 86400) return Math.round(seconds / 3600) + " hours";
        if (seconds < 31536000) return Math.round(seconds / 86400) + " days";
        if (seconds < 3153600000) return Math.round(seconds / 31536000) + " years";
        return "centuries";
    }

    function estimate(value) {
        const common = ["password", "123456", "12345678", "qwerty", "admin", "letmein", "iloveyou", "budi2005!"];
        if (common.indexOf(value.toLowerCase()) !== -1) {
            return { seconds: 0, level: "weak" };
        }
        let pool = 0;
        if (/[a-z]/.test(value)) pool += 26;
        if (/[A-Z]/.test(value)) pool += 26;
        if (/[0-9]/.test(value)) pool += 10;
        if (/[^a-zA-Z0-9]/.test(value)) pool += 32;

        const seconds = Math.pow(pool, value.length) / 1e10 / 2;   // 10 billion guesses per second
        const level = seconds < 86400 ? "weak" : seconds < 3153600000 ? "medium" : "strong";
        return { seconds: seconds, level: level };
    }

    passwordInput.addEventListener("input", function () {
        const value = passwordInput.value;

        if (value === "") {
            strengthText.textContent = "";
            setTone(strengthText, null);
            return;
        }
        const r = estimate(value);
        const label = { weak: "Weak", medium: "Medium", strong: "Strong" }[r.level];
        setTone(strengthText, { weak: "bad", medium: "warn", strong: "good" }[r.level]);
        strengthText.textContent = label + ". A fast attacker could crack this " + (r.seconds < 1 ? "instantly" : "in about " + formatTime(r.seconds)) + " (rough estimate).";
    });

    const genLength = document.querySelector("#gen-length");
    const genLengthValue = document.querySelector("#gen-length-value");
    const genSymbols = document.querySelector("#gen-symbols");
    const generateBtn = document.querySelector("#generate-btn");
    const generatedPassword = document.querySelector("#generated-password");

    genLength.addEventListener("input", function () {
        genLengthValue.textContent = genLength.value;
    });

    generateBtn.addEventListener("click", function () {
        const pw = randomPassword(Number(genLength.value), genSymbols.checked);
        generatedPassword.textContent = pw;
        passwordInput.value = pw;
        passwordInput.dispatchEvent(new Event("input"));
    });

})();


/* =========================================================
   TASK 02 - HANDLE USER EVENT
   User action -> Event -> JavaScript -> UI response
   ========================================================= */


/* ---------- CLICK: mobile menu ---------- */
const menuBtn = document.querySelector("#menu-btn");
const navMenu = document.querySelector("#nav-menu");

function setMenu(open) {
    if (!menuBtn || !navMenu) {
        return;
    }
    // "hidden md:flex" in the HTML keeps the menu visible on desktop
    navMenu.classList.toggle("hidden", !open);
    navMenu.classList.toggle("flex", open);
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menuBtn.innerHTML = open ? "&times;" : "&#9776;";
}

if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", function () {
        setMenu(navMenu.classList.contains("hidden"));
    });

    // close the menu after choosing a link
    navMenu.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
            setMenu(false);
        }
    });

    // close the menu with the Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            setMenu(false);
        }
    });
}


/* ---------- CLICK: show / hide detail ---------- */
const detailBtn = document.querySelector("#detail-btn");
const homeDetail = document.querySelector("#home-detail");

if (detailBtn && homeDetail) {
    detailBtn.addEventListener("click", function () {
        const willShow = homeDetail.hidden;
        homeDetail.hidden = !willShow;
        detailBtn.textContent = willShow ? "Hide details" : "Why does this matter?";
        detailBtn.setAttribute("aria-expanded", willShow);
    });
}


/* ---------- INPUT: search threats ---------- */
const searchInput = document.querySelector("#search-input");
const searchInfo = document.querySelector("#search-info");
const noResults = document.querySelector("#no-results");
const attackCards = document.querySelectorAll(".attack-card");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        const keyword = searchInput.value.trim().toLowerCase();
        let found = 0;

        attackCards.forEach(function (card) {
            const text = (card.textContent + " " + card.dataset.keywords).toLowerCase();
            const match = text.includes(keyword);
            card.hidden = !match;
            if (match) {
                found++;
            }
        });

        if (noResults) {
            noResults.hidden = found > 0;
        }
        if (searchInfo) {
            searchInfo.textContent = keyword === "" ? "" : found + " of " + attackCards.length + " threats found.";
        }
    });
}


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