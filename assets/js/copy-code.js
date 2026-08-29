// A copy button on every code block.
//
// No dependency: navigator.clipboard covers every browser this theme targets.
// Where it is absent — an insecure origin, mainly — no button is added, rather
// than one that does nothing when pressed.

(function () {
  if (!navigator.clipboard) return;

  var script = document.currentScript;
  var label = (script && script.dataset.label) || 'Copy';
  var done = (script && script.dataset.labelDone) || 'Copied';
  var failed = (script && script.dataset.labelFailed) || 'Press Ctrl+C';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('pre').forEach(function (pre) {
      // Mermaid renders into a pre, and there is no source worth copying there.
      if (pre.classList.contains('mermaid') || !pre.querySelector('code')) return;

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = label;
      // No aria-label. It would win over the text and freeze the name at
      // "Copy", so neither the confirmation nor the fallback instruction ever
      // reached a screen reader. aria-live announces the change instead.
      button.setAttribute('aria-live', 'polite');

      function flash(text, className) {
        button.textContent = text;
        button.classList.add(className);
        setTimeout(function () {
          button.textContent = label;
          button.classList.remove(className);
        }, 1600);
      }

      button.addEventListener('click', function () {
        // The button lives inside the pre, so its own label would otherwise be
        // copied along with the code.
        //
        // textContent, not innerText. Chroma wraps each line of a highlighted
        // block in a span it styles display: flex, which makes every line a
        // block-level box, and innerText inserts a line break at each of those
        // boundaries on top of the newline already in the source. That put a
        // blank line between every line of copied code. It only showed once
        // Prism was gone: Prism used to replace the block's markup with its
        // own, flex spans included. textContent reads the source as written.
        var code = pre.querySelector('code').textContent;

        navigator.clipboard.writeText(code).then(
          function () {
            flash(done, 'copy-code--done');
          },
          function () {
            // No permission, or the document lost focus. Say so instead of
            // looking like it worked, and select the code so it can still be
            // copied by hand.
            flash(failed, 'copy-code--failed');
            var range = document.createRange();
            range.selectNodeContents(pre.querySelector('code'));
            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
        );
      });

      pre.appendChild(button);
    });
  });
})();
