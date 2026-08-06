/* Theme toggle + scroll reveal + active nav */
(function () {
  var root = document.documentElement;

  // --- theme ---
  // Dark is the default look. Swap 'dark' for 'light' below to flip the default.
  var saved = null;
  try { saved = window.__theme || null; } catch (e) {}
  root.setAttribute('data-theme', saved || 'dark');

  function paint(btn) {
    if (btn) btn.textContent = root.getAttribute('data-theme') === 'light' ? '☽' : '☀';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    paint(btn);
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        window.__theme = next;
        paint(btn);
      });
    }

    // --- active nav link ---
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.indexOf('#') !== -1) return;           // in-page jump links are never "active"
      if (href.split('/').pop() === here) a.classList.add('active');
    });

    // On the home page, highlight the section you're currently scrolled to.
    if (here === 'index.html' || here === '') {
      var secs = [].slice.call(document.querySelectorAll('section[id]'));
      var map = {};
      document.querySelectorAll('.nav-links a[href*="#"]').forEach(function (a) {
        map[a.getAttribute('href').split('#')[1]] = a;
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var link = map[e.target.id];
          if (link) link.classList.toggle('active', e.isIntersecting);
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      secs.forEach(function (s) { spy.observe(s); });
    }

    // --- scroll reveal ---
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });

    // --- portrait tilt + sheen (pointer devices only) ---
    var card = document.querySelector('.portrait');
    var wrap = document.querySelector('.portrait-wrap');
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (card && wrap && fine && !calm) {
      var MAX = 9;          // degrees of tilt at the far edge. higher reads as gimmicky.
      var frame = null;

      wrap.addEventListener('mousemove', function (e) {
        if (frame) return;                        // throttle to one update per frame
        frame = requestAnimationFrame(function () {
          frame = null;
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width;
          var py = (e.clientY - r.top) / r.height;
          var rotY = (px - 0.5) * 2 * MAX;
          var rotX = (0.5 - py) * 2 * MAX;
          card.style.transition = 'filter 0.3s ease, box-shadow 0.35s ease';
          card.style.transform =
            'rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) scale(1.03)';
          // shadow leans away from the cursor, as if the light were where the mouse is
          card.style.setProperty('--gx', ((0.5 - px) * 26).toFixed(1) + 'px');
          card.style.setProperty('--gy', ((0.5 - py) * 18).toFixed(1) + 'px');
        });
      });

      wrap.addEventListener('mouseenter', function () { card.classList.add('tilting'); });

      wrap.addEventListener('mouseleave', function () {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        card.classList.remove('tilting');
        card.style.transition = '';               // back to the slow ease from the stylesheet
        card.style.transform = '';
        card.style.removeProperty('--gx');
        card.style.removeProperty('--gy');
      });
    }

    // --- typed role line ---
    var typed = document.querySelector('[data-typed]');
    if (typed) {
      var words = JSON.parse(typed.getAttribute('data-typed'));
      var w = 0, c = 0, del = false;
      var out = typed.querySelector('.typed-text');
      (function tick() {
        var word = words[w];
        c += del ? -1 : 1;
        out.textContent = word.slice(0, c);
        var wait = del ? 45 : 85;
        if (!del && c === word.length) { del = true; wait = 1600; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
        setTimeout(tick, wait);
      })();
    }
  });
})();
