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
