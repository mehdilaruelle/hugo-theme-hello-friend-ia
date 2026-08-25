// Initialises Mermaid on pages that carry a diagram, and re-draws it when the
// reader changes theme.
//
// In a file rather than an inline module, so a site with a strict CSP does not
// have to allow script-src 'unsafe-inline' for its diagram pages. The import is
// dynamic because this file is only fetched where a diagram exists, and the
// library should be too.

(function () {
  var script = document.currentScript;
  var src = script && script.dataset.mermaidSrc;
  if (!src) return;

  var root = document.documentElement;

  function isDark() {
    return root.dataset.theme === 'dark' ||
      (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  // Mermaid replaces the source with an SVG, so the source has to be kept to
  // draw it a second time. Read now, while it is still on the page.
  var blocks = [].slice.call(document.querySelectorAll('.mermaid'));
  var sources = blocks.map(function (el) { return el.textContent; });

  import(src).then(function (module) {
    var mermaid = module.default;

    function draw() {
      // startOnLoad hangs off DOMContentLoaded, which has already fired by the
      // time a dynamic import resolves — the diagram would never be drawn.
      // Render explicitly instead.
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark() ? 'dark' : 'base',
        darkMode: isDark(),
        themeVariables: { tertiaryColor: '#dee3ed' }
      });
      return mermaid.run();
    }

    function redraw() {
      blocks.forEach(function (el, i) {
        el.removeAttribute('data-processed');
        el.textContent = sources[i];
      });
      return draw();
    }

    draw().then(function () {
      // A diagram drawn for one theme is not readable on the other. Mermaid's
      // dark theme labels in #ccc, and on the light theme's node fill that is
      // 1.33:1. It was drawn once at load and never again, so a reader who
      // arrived dark and switched to light could not read it.
      //
      // An observer rather than a hook into the toggle: it also catches a site
      // that sets data-theme some other way, and it keeps this file from
      // knowing anything about main.js.
      var last = isDark();

      new MutationObserver(function () {
        if (isDark() === last) return;
        last = isDark();
        redraw();
      }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

      // And the system preference, for a page that never gets data-theme.
      var query = window.matchMedia('(prefers-color-scheme: dark)');
      if (query.addEventListener) {
        query.addEventListener('change', function () {
          if (root.dataset.theme) return;
          if (isDark() === last) return;
          last = isDark();
          redraw();
        });
      }
    });
  });
})();
