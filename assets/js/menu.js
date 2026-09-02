// Mobile menu

const menuTrigger = document.querySelector(".menu-trigger");
const menu = document.querySelector(".menu");
const languageSwitcher = document.querySelector(".language-switcher");
const mobileQuery = getComputedStyle(document.body).getPropertyValue(
  "--phoneWidth"
);
const isMobile = () => window.matchMedia(mobileQuery).matches;
// aria-expanded says whether the panel is open, so the button announces its
// own state rather than only its name.
const setExpanded = () =>
  menuTrigger &&
  menu &&
  menuTrigger.setAttribute(
    "aria-expanded",
    String(!menu.classList.contains("hidden"))
  );

const isMobileMenu = () => {
  menuTrigger && menuTrigger.classList.toggle("hidden", !isMobile());
  menu && menu.classList.toggle("hidden", isMobile());
  setExpanded();
};

isMobileMenu();

// Rendered disabled, so a page served without this script does not offer a
// control that cannot work.
menuTrigger && menuTrigger.removeAttribute("disabled");

const closeLanguageSwitcher = () => {
  if (languageSwitcher) languageSwitcher.open = false;
};

menuTrigger &&
  menuTrigger.addEventListener("click", () => {
    // Both open into the same corner, so opening one closes the other.
    closeLanguageSwitcher();
    menu && menu.classList.toggle("hidden");
    setExpanded();
  });

window.addEventListener("resize", isMobileMenu);

// The switcher is a details element and opens on its own. Only what a details
// cannot do for itself is added here.
if (languageSwitcher) {
  languageSwitcher.addEventListener("toggle", () => {
    if (!languageSwitcher.open || !menu || !isMobile()) return;
    // Folding the menu away here has to keep the trigger's aria-expanded in
    // step, or it goes on claiming a menu that is no longer open.
    menu.classList.add("hidden");
    setExpanded();
  });

  document.addEventListener("click", (event) => {
    if (languageSwitcher.open && !languageSwitcher.contains(event.target)) {
      closeLanguageSwitcher();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !languageSwitcher.open) return;
    closeLanguageSwitcher();
    const summary = languageSwitcher.querySelector("summary");
    if (summary) summary.focus();
  });
}

const logo = document.querySelector(".logo__pathname");
if (logo) {
  window.addEventListener("load", () => {
    // Where this site starts, written by logo.html: the deployment prefix and
    // the language directory in one string, ending in "/". This used to strip
    // the leading "/" and the language code and take the first segment of what
    // was left, which is the section only when the site is at the domain root.
    // Under a prefix the first segment is the prefix, so every page named it
    // instead of the section — as this theme's own showcase does in production.
    //
    // Stripping the language separately was its own bug: replace() finds its
    // argument anywhere, so an English site with a /green/ section matched the
    // "en/" inside it and printed "grex".
    const base = logo.dataset.base || "/";
    const path = window.location.pathname;
    const rest = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "");
    // The home page has no section to name, and adds nothing.
    logo.textContent += rest.split("/").filter(Boolean)[0] || "";
  });
}