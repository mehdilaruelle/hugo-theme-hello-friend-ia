// Mobile menu

const menuTrigger = document.querySelector(".menu-trigger");
const menu = document.querySelector(".menu");
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

menuTrigger &&
  menuTrigger.addEventListener("click", () => {
    menu && menu.classList.toggle("hidden");
    setExpanded();
  });

window.addEventListener("resize", isMobileMenu);

const language = document.getElementsByTagName('html')[0].lang;
const logo = document.querySelector(".logo__pathname");
if(logo){
  window.onload = () => {
    let path = window.location.pathname.substring(1);
    path = path.replace(language+'/','')
    logo.textContent += path.substring(0,path.indexOf('/'));
  };
}