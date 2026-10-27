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
