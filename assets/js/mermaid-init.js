// Initialises Mermaid on pages that carry a diagram.
//
// In a file rather than an inline module, so a site with a strict CSP does not
// have to allow script-src 'unsafe-inline' for its diagram pages. The import is
// dynamic because this file is only fetched where a diagram exists, and the
// library should be too.

(function () {
  var script = document.currentScript;
  var src = script && script.dataset.mermaidSrc;
  if (!src) return;

  var dark = document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  import(src).then(function (module) {
    // startOnLoad hangs off DOMContentLoaded, which has already fired by the
    // time a dynamic import resolves — the diagram would never be drawn. Render
    // explicitly instead.
    module.default.initialize({
      startOnLoad: false,
      theme: dark ? 'dark' : 'base',
      darkMode: dark,
      themeVariables: { tertiaryColor: '#dee3ed' }
    });
    return module.default.run();
  });
})();
