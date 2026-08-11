// Client-side search over the index the site publishes at build time.
//
// No library and no service: the index is one JSON file, fetched the first
// time someone types. A site of a few hundred posts is a few hundred KB, and
// filtering that in memory is faster than a round trip would be.
//
// The form is hidden in the markup and revealed here, so a visitor without
// JavaScript is told search is unavailable rather than handed a dead box.

(function () {
  var form = document.querySelector("[data-search]");
  if (!form) return;

  var input = form.querySelector("input[type=search]");
  var status = document.querySelector("[data-search-status]");
  var list = document.querySelector("[data-search-results]");
  var url = form.getAttribute("data-index");

  form.hidden = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  var index = null;
  var loading = null;

  // Accents are a spelling detail, not a distinction the reader is making:
  // "resume" should find "résumé". NFD splits a letter from its accent, and
  // the range strips the accents that are now their own characters.
  function fold(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (data) {
        index = data.map(function (p) {
          return {
            page: p,
            haystack: fold(
              [p.title, (p.tags || []).join(" "), p.summary, p.content].join(" ")
            ),
            title: fold(p.title),
            tags: fold((p.tags || []).join(" ")),
          };
        });
        return index;
      })
      .catch(function (e) {
        // Forget the failure, or every later keystroke would be handed this
        // same rejected promise and search would stay broken until reload.
        loading = null;
        throw e;
      });
    return loading;
  }

  // Every word has to appear somewhere, in any order — the way a reader
  // expects two words typed together to narrow the result rather than widen it.
  function match(entry, terms) {
    for (var i = 0; i < terms.length; i++) {
      if (entry.haystack.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  // A hit in the title says more about the page than a hit in the body.
  function score(entry, terms) {
    var n = 0;
    for (var i = 0; i < terms.length; i++) {
      if (entry.title.indexOf(terms[i]) !== -1) n += 10;
      if (entry.tags.indexOf(terms[i]) !== -1) n += 4;
    }
    return n;
  }

  function say(key, count) {
    var t = form.getAttribute("data-hits-" + key) || "";
    status.textContent = t.replace("%d", count);
  }

  // Every render takes a number, and only the newest one is allowed to write
  // to the page. Without it a slow query that resolves late overwrites the
  // results of a newer one, or refills a list the visitor has just cleared.
  var generation = 0;

  function render(query) {
    var mine = ++generation;
    var terms = fold(query).split(/\s+/).filter(Boolean);
    list.innerHTML = "";

    if (!terms.length) {
      status.textContent = "";
      return;
    }

    // The index is fetched on the first keystroke, and on a slow link that
    // wait is dead air: say so rather than leave the page looking inert.
    if (!index) say("loading", 0);

    load()
      .then(function (entries) {
        if (mine !== generation) return;

        var hits = entries
          .filter(function (e) {
            return match(e, terms);
          })
          .sort(function (a, b) {
            var d = score(b, terms) - score(a, terms);
            return d !== 0 ? d : (b.page.date || "").localeCompare(a.page.date || "");
          });

        say(hits.length === 1 ? "one" : "many", hits.length);

        var frag = document.createDocumentFragment();
        hits.forEach(function (h) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.href = h.page.url;
          a.textContent = h.page.title;
          li.appendChild(a);
          if (h.page.date) {
            var time = document.createElement("time");
            time.dateTime = h.page.date;
            time.textContent = h.page.date;
            li.appendChild(time);
          }
          if (h.page.summary) {
            var p = document.createElement("p");
            // textContent, not innerHTML: the summary is content, and content
            // is not markup to be executed.
            p.textContent = h.page.summary;
            li.appendChild(p);
          }
          frag.appendChild(li);
        });
        list.appendChild(frag);
      })
      .catch(function () {
        if (mine !== generation) return;
        say("failed", 0);
      });
  }

  var timer;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    var q = input.value;
    timer = setTimeout(function () {
      render(q);
      // Keep the query in the URL so a result list can be shared or reloaded,
      // without adding an entry to the back button for every keystroke.
      var next = q ? "?q=" + encodeURIComponent(q) : location.pathname;
      history.replaceState(null, "", next);
    }, 120);
  });

  // Arriving with ?q= runs the search straight away.
  var initial = new URLSearchParams(location.search).get("q");
  if (initial) {
    input.value = initial;
    render(initial);
  }
  input.focus();
})();
