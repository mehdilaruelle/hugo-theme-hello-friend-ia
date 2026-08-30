// Autoplay, and the visitors who have asked for less of it.
//
// The video shortcode replaces an animated GIF, so by default it plays on a
// loop. A loop is motion that never ends, and prefers-reduced-motion is a
// request not to be shown it. No stylesheet can answer that one: autoplay is
// an HTML attribute, not something CSS can turn off.
//
// The poster stays, so the picture is still there -- it simply waits to be
// started. The controls come from the markup, not from here, so a visitor
// without this script still has a pause button.

(function () {
  var query = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!query) return;

  function settle() {
    if (!query.matches) return;
    var videos = document.querySelectorAll('video[autoplay]');
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      v.autoplay = false;
      v.loop = false;
      v.removeAttribute('autoplay');
      v.removeAttribute('loop');
      // It may already have started before this ran.
      if (!v.paused) v.pause();
      // Back to the first frame, so the poster's promise is kept.
      try { v.currentTime = 0; } catch (e) {}
    }
  }

  settle();
  document.addEventListener('DOMContentLoaded', settle);
  // The preference can change while the page is open.
  if (query.addEventListener) query.addEventListener('change', settle);
  else if (query.addListener) query.addListener(settle);
})();
