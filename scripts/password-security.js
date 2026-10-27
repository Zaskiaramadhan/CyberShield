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
