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
    // The folded menu and the language panel open into the same corner of the
    // header, so the one being opened closes the other rather than landing on
    // top of it.
    closeLanguageSwitcher();
    menu && menu.classList.toggle("hidden");
    setExpanded();
  });

window.addEventListener("resize", isMobileMenu);

// Language switcher.
//
// It is a details element, so opening and closing it is the browser's own job
// and it still works with this file blocked. What is added here is only what a
// details cannot do for itself.
if (languageSwitcher) {
  languageSwitcher.addEventListener("toggle", () => {
    if (!languageSwitcher.open || !menu || !isMobile()) return;
    // Folding the menu away here has to keep the trigger's aria-expanded in
    // step, or it goes on claiming a menu that is no longer open.
    menu.classList.add("hidden");
    setExpanded();
  });

  // A click anywhere else closes it. Without this the panel stays open until
  // the summary is clicked a second time, which is not what a menu that opened
  // over the page is expected to do.
  document.addEventListener("click", (event) => {
    if (languageSwitcher.open && !languageSwitcher.contains(event.target)) {
      closeLanguageSwitcher();
    }
  });

  // Escape closes it and puts focus back on the globe, so a keyboard visitor
  // who opened it by mistake is not left inside a list they did not want.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !languageSwitcher.open) return;
    closeLanguageSwitcher();
    const summary = languageSwitcher.querySelector("summary");
    if (summary) summary.focus();
  });
}

const language = document.getElementsByTagName('html')[0].lang;
const logo = document.querySelector(".logo__pathname");
if(logo){
  window.onload = () => {
    let path = window.location.pathname.substring(1);
    path = path.replace(language+'/','')
    logo.textContent += path.substring(0,path.indexOf('/'));
  };
}