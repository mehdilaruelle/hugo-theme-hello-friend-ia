/**
 * Theming.
 *
 * Supports the preferred color scheme of the operating system as well as
 * the theme choice of the user.
 *
 */
const themeToggle = document.querySelector(".theme-toggle");
// Rendered by the server from params.defaultTheme, read before any script
// changes the attribute.
const defaultTheme = document.documentElement.getAttribute("data-theme");

// Storage throws rather than returning null in some privacy modes, and a
// colour scheme is not worth breaking the page over.
function readStoredTheme() {
  try {
    return window.localStorage.getItem("theme");
  } catch (e) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    window.localStorage.setItem("theme", theme);
  } catch (e) {
    // Not persisted; the current page still switches.
  }
}

function forgetTheme() {
  try {
    window.localStorage.removeItem("theme");
  } catch (e) {
    // Nothing to forget.
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

// Read on every call: a choice made since page load has to win.
function detectOSColorTheme() {
  const chosen = readStoredTheme();

  if (chosen === "dark" || chosen === "light") {
    applyTheme(chosen);
  } else if (defaultTheme) {
    applyTheme(defaultTheme);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }
}

// Switch the theme, applying it to the page rather than reloading it.
function switchTheme() {
  const next =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";

  storeTheme(next);
  applyTheme(next);
}

// Event listener
if (themeToggle) {
  themeToggle.addEventListener("click", switchTheme, false);
  // Follow the system only while the visitor has expressed no preference.
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => !readStoredTheme() && detectOSColorTheme());
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", () => !readStoredTheme() && detectOSColorTheme());

  detectOSColorTheme();
} else {
  forgetTheme();
}
