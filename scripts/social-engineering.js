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
