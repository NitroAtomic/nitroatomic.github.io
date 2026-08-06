/* Scroll reveal, active nav, matrix rain and the UI animation layer */
(function () {
  var root = document.documentElement;

  // Marks that JS is alive. CSS only hides scroll-reveal content when this is set,
  // so a JS failure degrades to "everything visible" instead of a blank page.
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
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

    var calmMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- stat numbers count up when they scroll into view ---
    var nums = document.querySelectorAll('.stat .num');
    if (nums.length && !calmMotion) {
      // Blank them here rather than in the observer callback, so the real value
      // never flashes on screen before the count starts.
      nums.forEach(function (n) {
        var raw = n.textContent.trim();
        if (!parseInt(raw.replace(/\D/g, ''), 10)) return;
        n.dataset.final = raw;
        n.textContent = '0' + raw.replace(/[\d]/g, '');
      });

      var countIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          countIO.unobserve(e.target);
          var el = e.target;
          var raw = el.dataset.final;
          if (!raw) return;
          var target = parseInt(raw.replace(/\D/g, ''), 10);
          var suffix = raw.replace(/[\d]/g, '');   // keeps things like a trailing "+"
          var dur = 1100, t0 = null;

          // A small target only has a handful of integer steps. With a hard ease-out
          // it hits its final value a third of the way in and then sits there while
          // the four-digit tiles are still spinning, which reads as broken. Small
          // numbers therefore ramp linearly so every tile lands together.
          var gentle = target <= 20;

          function step(ts) {
            if (t0 === null) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = gentle ? p : 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = raw;             // land exactly on the original string
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { countIO.observe(n); });

      // Safety net: if a tile somehow never crosses the threshold (odd viewport,
      // observer never fires), restore the real number rather than leaving a 0.
      setTimeout(function () {
        nums.forEach(function (n) {
          if (n.dataset.final && n.textContent.trim() === '0' + n.dataset.final.replace(/[\d]/g, '')) {
            n.textContent = n.dataset.final;
          }
        });
      }, 4000);
    }

    // --- skill tags flip in one by one ---
    var tagLists = document.querySelectorAll('.tags');
    if (!calmMotion) {
      var tagIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          tagIO.unobserve(e.target);
          e.target.classList.add('stagger');
          [].forEach.call(e.target.children, function (li, i) {
            li.style.animationDelay = (i * 45) + 'ms';
          });
        });
      }, { threshold: 0.2 });
      tagLists.forEach(function (l) { tagIO.observe(l); });
    }

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

    // ===================== UI ANIMATION LAYER =====================
    if (!calmMotion) {

      // --- scroll progress bar + nav compact + back-to-top ---
      var bar = document.createElement('div');
      bar.className = 'progress';
      document.body.appendChild(bar);

      var top = document.createElement('button');
      top.className = 'to-top';
      top.setAttribute('aria-label', 'Back to top');
      top.textContent = '↑';
      top.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      document.body.appendChild(top);

      var nav = document.querySelector('.nav');
      var ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var max = document.documentElement.scrollHeight - window.innerHeight;
          var y = window.scrollY;
          bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
          if (nav) nav.classList.toggle('compact', y > 40);
          top.classList.toggle('show', y > 600);
        });
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // --- cursor spotlight across cards ---
      var lit = document.querySelectorAll('.card, .project');
      lit.forEach(function (el) {
        var f = null;
        el.addEventListener('mousemove', function (e) {
          if (f) return;
          f = requestAnimationFrame(function () {
            f = null;
            var r = el.getBoundingClientRect();
            el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
            el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
          });
        });
        el.addEventListener('mouseenter', function () { el.classList.add('lit'); });
        el.addEventListener('mouseleave', function () { el.classList.remove('lit'); });
      });

      // --- hero headline rises word by word ---
      var h1 = document.querySelector('.hero h1');
      if (h1) {
        var html = h1.innerHTML;
        // split on spaces but keep the <span class="accent"> wrapper intact
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var out = '';
        [].forEach.call(tmp.childNodes, function (n) {
          if (n.nodeType === 3) {
            n.textContent.split(/(\s+)/).forEach(function (w) {
              out += /^\s+$/.test(w) ? w : (w ? '<span>' + w + '</span>' : '');
            });
          } else {
            out += '<span>' + n.outerHTML + '</span>';
          }
        });
        h1.innerHTML = out;
        h1.classList.add('rise');
        [].forEach.call(h1.querySelectorAll(':scope > span'), function (s, i) {
          s.style.animationDelay = (80 + i * 90) + 'ms';
        });
      }
    }


    // --- matrix rain backdrop ---
    if (!calmMotion) {
      var cv = document.createElement('canvas');
      cv.id = 'matrix';
      cv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cv);
      var ctx = cv.getContext('2d');

      var GLYPHS = 'アカサタナハマヤラワィゥヴカ0123456789ABCDEF<>[]{}/\\|=+*#$%'.split('');
      // wider spacing and a lower frame rate on phones: fewer columns, less battery
      var small = innerWidth < 640;
      var FONT = small ? 20 : 16, cols = 0, drops = [], speeds = [], dpr = 1;

      function rainColor() {
        var c = getComputedStyle(document.documentElement).getPropertyValue('--matrix').trim();
        return c || '#38bdf8';
      }

      function size() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        cv.width = Math.floor(innerWidth * dpr);
        cv.height = Math.floor(innerHeight * dpr);
        cv.style.width = innerWidth + 'px';
        cv.style.height = innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cols = Math.ceil(innerWidth / FONT);
        drops = []; speeds = [];
        for (var i = 0; i < cols; i++) {
          drops.push(Math.random() * -60);              // stagger the start so it does not fall as one wall
          speeds.push(0.35 + Math.random() * 0.55);     // per-column speed keeps it from looking mechanical
        }
      }

      // Erase old trails instead of painting the background colour over them.
      // Painting white each frame left a grey haze on the light theme; wiping with
      // destination-out keeps the canvas genuinely transparent so the page shows through.
      var fadeAlpha = 0.09;
      function refreshFade() {
        fadeAlpha = parseFloat(getComputedStyle(document.documentElement)
                     .getPropertyValue('--matrix-fade')) || 0.09;
      }

      var last = 0, FPS = small ? 15 : 24;
      function frame(ts) {
        requestAnimationFrame(frame);
        if (document.hidden) return;                    // stop burning CPU on a background tab
        if (ts - last < 1000 / FPS) return;
        last = ts;

        ctx.globalCompositeOperation = 'destination-out';   // wipe, do not paint
        ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')';
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.font = FONT + 'px ' + (getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace');

        var col = rainColor();
        for (var i = 0; i < cols; i++) {
          var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
          var y = drops[i] * FONT;
          if (y > 0) {
            ctx.fillStyle = col;                        // bright head of the column
            ctx.globalAlpha = 0.85;
            ctx.fillText(ch, i * FONT, y);
            ctx.globalAlpha = 0.35;                     // dimmer character just behind it
            ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], i * FONT, y - FONT);
            ctx.globalAlpha = 1;
          }
          drops[i] += speeds[i];
          if (y > innerHeight && Math.random() > 0.975) drops[i] = Math.random() * -20;
        }
      }

      size(); refreshFade();
      addEventListener('resize', function () { size(); refreshFade(); }, { passive: true });
      requestAnimationFrame(frame);
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
