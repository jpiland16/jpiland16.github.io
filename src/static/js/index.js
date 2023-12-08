const ONLOAD_ADDONS = []

function checkColorScheme() {
    const intendedColorScheme = localStorage.getItem("colorScheme")
    // Default is dark
    if (intendedColorScheme === "light-theme") switchLightDarkTheme()
    window.setTimeout(() => 
        document.documentElement.classList.add("animatable"), 100)
        // slight delay prevents unwanted flashing
}

function switchLightDarkTheme() {
    const classes = document.documentElement.classList
    if (classes.contains("light-theme")) {
        classes.remove("light-theme")
        classes.add("dark-theme")
        localStorage.setItem("colorScheme", "dark-theme")
    } else {
        classes.remove("dark-theme")
        classes.add("light-theme")
        localStorage.setItem("colorScheme", "light-theme")
    }
    if (typeof showCookies !== 'undefined') showCookies() // cookies page
}

function getMenu() {
    return document.getElementById("overlay-menu-container")
}

function showHideMenu(show = false) {
    const menu = getMenu()
    if (show) {
        menu.style.display = "block";
        setTimeout(() => menu.style.opacity = 1, 0) // magic to allow CSS transition
    } else {
        menu.style.opacity = 0
        setTimeout(() => menu.style.display = "none", modalAnimationSpeed * 1000)
    }
}

function toggleMenu() {
    const menu = getMenu()
    showHideMenu(menu.style.display !== "block")
}

function showMenu() {
    showHideMenu(true)
}

function hideMenu() {
    showHideMenu(false)
}

// Occurs before page load
checkColorScheme()
const modalAnimationSpeedString = getComputedStyle(document.documentElement)
    .getPropertyValue("--modal-animation-speed")
const modalAnimationSpeed = modalAnimationSpeedString
    .substring(0, modalAnimationSpeedString.length - 1)

if (!localStorage.getItem("visitedSite")) {
    localStorage.setItem("visitedSite", "true")
    document.documentElement.classList.add("unvisited")
}

// Occurs after page load
function onLoad() {
    updateCopyrightYear()
    createMenu()
    ONLOAD_ADDONS.forEach((f) => f())
    document.documentElement.classList.remove("unvisited")
}

function updateCopyrightYear() {
    const e = document.getElementById("menu-info")
    e.innerText =  e.innerText.replace("2022", new Date().getFullYear().toString())
}
