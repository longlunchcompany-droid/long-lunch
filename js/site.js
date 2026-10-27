/* =========================================================
   Long Lunch — site logic
   - Poster text and artwork live in js/posters.js
   - Prices, staging (which room each poster hangs in) and the
     grid layout live at the top of this file.
   ========================================================= */
(function () {
  'use strict';

  var POSTERS = window.LL_POSTERS || [];

  // ---------- Your details (fill these in; empty ones stay hidden on the site) ----------
  var SITE = {
    email: 'longlunchcompany@gmail.com',
    instagram: '',      // full link, e.g. 'https://www.instagram.com/yourname'
    pinterest: ''       // full link, e.g. 'https://www.pinterest.com/yourname'
  };

  // ---------- Prices (NOK, including 25% VAT) ----------
  var SIZES = [
    { id: 'a4',     label: 'A4',       sub: '21 × 30 cm', text: 'A4 (21 × 30 cm)', print: 249, framed: 549,  width: '24%' },
    { id: '30x40',  label: '30 × 40',  sub: 'cm',         text: '30 × 40 cm',      print: 349, framed: 799,  width: '32%' },
    { id: '50x70',  label: '50 × 70',  sub: 'cm',         text: '50 × 70 cm',      print: 549, framed: 1199, width: '45%' },
    { id: '70x100', label: '70 × 100', sub: 'cm',         text: '70 × 100 cm',     print: 749, framed: 1649, width: '60%' }
  ];
  var FRAMES = [
    { id: 'none',  label: 'Print only', swatch: '#FBF9F4', text: 'print only' },
    { id: 'black', label: 'Black',      swatch: '#1C1B18', text: 'black frame' },
    { id: 'oak',   label: 'Oak',        swatch: '#B88A5A', text: 'oak frame' }
  ];
  var SHIPPING = 79;
  var FREE_SHIPPING_FROM = 999;
  var FROM_PRICE = SIZES[0].print;

  // ---------- Staging: how each poster is shown in the shop ----------
  // type: tape (used for all now) | table | window | ledge | clip | floor | sun
  // roomWall: wall colour on the product page (defaults to wall)
  // focus: the part of the poster shown in "Up close" (percent across, down)
  // Every poster is taped to the same plain plaster wall; rot is its slight tilt in degrees.
  var WALL = '#ECEAE3';
  var STAGING = {
    stay:   { type: 'tape', wall: WALL, frame: 'none', rot: -1.4, focus: [26, 36] },
    oyster: { type: 'tape', wall: WALL, frame: 'none', rot: 1.2,  focus: [30, 22] },
    ace:    { type: 'tape', wall: WALL, frame: 'none', rot: -0.7, focus: [24, 24] },
    cheers: { type: 'tape', wall: WALL, frame: 'none', rot: 1.6,  focus: [50, 44] },
    table:  { type: 'tape', wall: WALL, frame: 'none', rot: -1.9, focus: [70, 40] },
    swim:   { type: 'tape', wall: WALL, frame: 'none', rot: 0.9,  focus: [44, 57] }
  };
  var DEFAULT_STAGING = { type: 'tape', wall: WALL, frame: 'none', rot: 1, focus: [50, 40] };

  // Grid slots on the home page (see .slot-* in css) and the odd handwritten note.
  var LAYOUT = {
    stay:   { slot: 'a', ar: '1 / 1' },
    oyster: { slot: 'b', ar: '3 / 4' },
    ace:    { slot: 'c', ar: '4 / 5' },
    cheers: { slot: 'd', ar: '3 / 4' },
    table:  { slot: 'e', ar: '4 / 5' },
    swim:   { slot: 'f', ar: '6 / 5' }
  };
  var THEME_COLORS = { 'Words to live by': '#1F48C4', 'At the table': '#C2311F', 'By the sea': '#1F3366' };

  // ---------- Helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function kr(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' kr'; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/[<]/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function find(id) {
    for (var i = 0; i < POSTERS.length; i++) if (POSTERS[i].id === id) return POSTERS[i];
    return null;
  }
  function staging(id) { return STAGING[id] || DEFAULT_STAGING; }
  var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  // ---------- Posters (inline SVG) ----------
  // IDs inside each SVG get a unique suffix so a poster can appear several times on a page.
  var uid = 0;
  function posterSvg(id, describe) {
    var p = find(id);
    if (!p) return '';
    uid += 1;
    var svg = p.svg;
    var re = /\bid="([^"]+)"/g, m, ids = [];
    while ((m = re.exec(svg))) ids.push(m[1]);
    ids.forEach(function (x) {
      var nx = x + '-' + uid;
      svg = svg.split('id="' + x + '"').join('id="' + nx + '"')
               .split('#' + x + ')').join('#' + nx + ')')
               .split('href="#' + x + '"').join('href="#' + nx + '"');
    });
    if (!describe) svg = svg.replace(' role="img"', ' aria-hidden="true" focusable="false"');
    return svg;
  }
  function mountOne(el) {
    if (el.firstChild) return;
    el.innerHTML = posterSvg(el.getAttribute('data-poster'), el.hasAttribute('data-describe'));
  }
  // Posters are drawn when they come near the screen, which keeps the page quick.
  var posterObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { mountOne(e.target); posterObserver.unobserve(e.target); }
    });
  }, { rootMargin: '700px 0px' }) : null;
  function mountPosters(root, now) {
    $all('[data-poster]', root).forEach(function (el) {
      if (el.firstChild) return;
      if (now || !posterObserver) mountOne(el); else posterObserver.observe(el);
    });
  }

  // ---------- Scenes ----------
  var CLIP_SVG =
    '<svg class="clip" viewBox="0 0 40 50" aria-hidden="true" focusable="false">' +
    '<circle cx="20" cy="5" r="3.4" fill="#4B4840"/>' +
    '<path d="M11 27 L 20 6 L 29 27" fill="none" stroke="#2E2C28" stroke-width="2.2" stroke-linejoin="round"/>' +
    '<rect x="5" y="25" width="30" height="20" rx="2.5" fill="#1A1A17"/>' +
    '<rect x="5" y="25" width="30" height="4" rx="1.5" fill="#45423C"/>' +
    '</svg>';

  function pieceClass(frame, lean) {
    return 'piece ' + (frame === 'none' ? 'piece--paper' : 'piece--framed piece--' + frame) + (lean ? ' piece--lean' : '');
  }

  function stageHTML(id, o) {
    var t = o.type;
    var lean = t === 'ledge' || t === 'floor';
    var inner = '<div class="mat"><div class="poster" data-poster="' + esc(id) + '"' + (o.describe ? ' data-describe' : '') + '></div></div>';
    if (t === 'tape' || t === 'room') inner += '<span class="tape tape-l"></span><span class="tape tape-r"></span>';
    if (t === 'clip') inner += CLIP_SVG;
    if (t === 'table') inner += '<span class="coffee-ring"></span>';
    if (o.note && o.note.where === 'piece') inner += noteHTML(o.note);
    var piece = '<div class="' + pieceClass(o.frame, lean) + '"' + (o.hang ? ' data-hang' : '') +
      ((o.vars || o.rot != null) ? ' style="' + esc((o.rot != null ? '--rot: ' + o.rot + 'deg; ' : '') + (o.vars || '')) + '"' : '') + '>' + inner + '</div>';
    var props = '';
    if (t === 'ledge') props = '<div class="ledge"></div><div class="vase"></div>';
    if (t === 'table') props = '<div class="cup"></div>';
    if (t === 'floor') props = '<div class="skirting"></div><div class="floor"></div><div class="books"><i></i><i></i><i></i></div>';
    // light-back falls on the wall only; light (front) adds a faint shadow over the poster
    return '<div class="stage"><div class="light-back"></div>' + props + piece + '<div class="light"></div><div class="vignette"></div></div>';
  }

  var ARROW_DOWN = '<svg viewBox="0 0 40 92" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" aria-hidden="true"><path d="M4 7 C 26 4, 36 24, 30 84" vector-effect="non-scaling-stroke"/><path d="M22 75 L 30 86 L 37 75" vector-effect="non-scaling-stroke"/></svg>';
  var ARROW_UP_RIGHT = '<svg viewBox="0 0 60 30" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 24 C 18 26, 36 20, 52 8"/><path d="M40 7 L 53 7 L 50 19"/></svg>';

  function noteHTML(n) {
    return '<span class="anno anno--' + n.where + '" style="--anno:' + n.color + '" aria-hidden="true">' +
      esc(n.text) + (n.where === 'piece' ? ARROW_DOWN : ARROW_UP_RIGHT) + '</span>';
  }

  function sceneHTML(id, o) {
    var type = o.type === 'room' ? 'tape scene--room' : o.type;
    var style = '--wall:' + o.wall + (o.ar ? '; --ar:' + o.ar : '');
    var html = '<div class="scene scene--' + type + '" style="' + style + '" data-scene-of="' + esc(id) + '">' + stageHTML(id, o);
    if (o.loupe) html += '<div class="loupe" aria-hidden="true"></div><span class="loupe-ring" aria-hidden="true"></span>';
    if (o.note && o.note.where !== 'piece') html += noteHTML(o.note);
    return html + '</div>';
  }

  // Scenes written straight into the HTML, e.g.
  // <div data-scene="stay" data-type="window" data-frame="black" data-vars="--py: 60%" data-note="…">
  function renderStaticScenes() {
    $all('[data-scene]').forEach(function (el) {
      var id = el.getAttribute('data-scene');
      var st = staging(id);
      var type = el.getAttribute('data-type') || st.type;
      var note = el.getAttribute('data-note');
      el.outerHTML = sceneHTML(id, {
        type: type,
        wall: type === st.type ? st.wall : (st.roomWall || st.wall),
        frame: el.getAttribute('data-frame') || st.frame,
        rot: st.rot,
        vars: el.getAttribute('data-vars'),
        note: note ? { text: note, where: el.getAttribute('data-note-where') || 'tl', color: el.getAttribute('data-note-color') || '#D8352A' } : null
      });
    });
  }

  // Magnifying loupe on poster cards (mouse and trackpad only)
  function enableLoupe(scene) {
    if (!canHover) return;
    var loupe = $('.loupe', scene);
    if (!loupe) return;
    var id = scene.getAttribute('data-scene-of');
    var filled = false;
    function place(ev) {
      var r = scene.getBoundingClientRect();
      scene.style.setProperty('--lx', ((ev.clientX - r.left) / r.width * 100).toFixed(2) + '%');
      scene.style.setProperty('--ly', ((ev.clientY - r.top) / r.height * 100).toFixed(2) + '%');
    }
    scene.addEventListener('pointerenter', function (ev) {
      if (!filled) {
        var st = staging(id);
        loupe.innerHTML = stageHTML(id, { type: st.type, frame: st.frame, rot: st.rot });
        mountPosters(loupe, true);
        filled = true;
      }
      place(ev);
      scene.classList.add('is-looking');
    });
    scene.addEventListener('pointermove', place);
    scene.addEventListener('pointerleave', function () { scene.classList.remove('is-looking'); });
  }

  // ---------- Cards ----------
  function cardHTML(p, uniform) {
    var st = staging(p.id);
    var lay = LAYOUT[p.id] || {};
    var slot = uniform ? '' : ' slot-' + (lay.slot || 'x');
    return '<a class="card' + slot + '" href="product.html?p=' + esc(p.id) + '" data-collection="' + esc(p.collection) + '" data-reveal' +
      ' style="--card-ar:' + (lay.ar || '4 / 5') + '; --c:' + (THEME_COLORS[p.collection] || '#1F48C4') + '">' +
      sceneHTML(p.id, { type: st.type, wall: st.wall, frame: st.frame, rot: st.rot, loupe: true, note: uniform ? null : lay.note }) +
      '<div class="card-cap">' +
        '<p class="card-no">No. ' + esc(p.no) + ' <span>· ' + esc(p.collection) + '</span></p>' +
        '<h3 class="card-title">' + esc(p.title) + '</h3>' +
        '<p class="card-price">From ' + kr(FROM_PRICE) + '</p>' +
        '<p class="card-tag">' + esc(p.tagline) + '</p>' +
        '<span class="card-view" aria-hidden="true">See it on the wall →</span>' +
      '</div></a>';
  }

  var PULL_QUOTE =
    '<figure class="pull slot-q" data-reveal>' +
      '<blockquote><p>“The kitchen closes at ten. The table does not.”</p></blockquote>' +
      '<figcaption>— <i>The Daily Lunch</i>, notices, page one. <a href="product.html?p=stay">Read the rest</a></figcaption>' +
    '</figure>';

  // ---------- Cart ----------
  // Saved in the visitor's own browser. Payment needs a shop platform (see LES-MEG.md).
  var CART_KEY = 'll-cart-items';
  function sizeById(id) { return SIZES.filter(function (s) { return s.id === id; })[0]; }
  function frameById(id) { return FRAMES.filter(function (f) { return f.id === id; })[0]; }
  function readItems() {
    try {
      var v = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(v)) return [];
      return v.filter(function (i) { return i && find(i.id) && sizeById(i.size) && frameById(i.frame) && i.qty > 0; });
    } catch (e) { return []; }
  }
  var cart = readItems();
  function saveItems() {
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
    showCart();
  }
  function itemPrice(i) { var s = sizeById(i.size); return i.frame === 'none' ? s.print : s.framed; }
  function cartCount() { return cart.reduce(function (n, i) { return n + i.qty; }, 0); }
  function cartSubtotal() { return cart.reduce(function (n, i) { return n + itemPrice(i) * i.qty; }, 0); }
  function showCart() { $all('[data-cart-count]').forEach(function (el) { el.textContent = String(cartCount()); }); }
  function addToCart(id, size, frame, qty) {
    var same = cart.filter(function (i) { return i.id === id && i.size === size && i.frame === frame; })[0];
    if (same) same.qty = Math.min(9, same.qty + qty);
    else cart.push({ id: id, size: size, frame: frame, qty: qty });
    saveItems();
  }

  function initCart() {
    var page = $('[data-cart-page]');
    if (!page) return;
    var list = $('[data-cart-list]', page);
    var summary = $('[data-cart-summary]', page);
    var empty = $('[data-cart-empty]', page);
    var note = $('[data-checkout-note]', page);

    function render() {
      empty.hidden = cart.length > 0;
      summary.hidden = cart.length === 0;
      list.innerHTML = cart.map(function (i, n) {
        var p = find(i.id), s = sizeById(i.size), f = frameById(i.frame);
        return '<li class="cart-row">' +
          '<a class="cart-thumb" href="product.html?p=' + esc(p.id) + '" aria-hidden="true" tabindex="-1"><span class="poster" data-poster="' + esc(p.id) + '"></span></a>' +
          '<div class="cart-info">' +
            '<p class="cart-no">No. ' + esc(p.no) + '</p>' +
            '<h2 class="cart-title"><a href="product.html?p=' + esc(p.id) + '">' + esc(p.title) + '</a></h2>' +
            '<p class="cart-opts">' + esc(s.text) + ', ' + esc(f.text) + ' · ' + kr(itemPrice(i)) + '</p>' +
            '<div class="cart-actions">' +
              '<div class="qty qty--small" role="group" aria-label="Quantity of ' + esc(p.title) + '">' +
                '<button type="button" data-row="' + n + '" data-step="-1" aria-label="One fewer">−</button>' +
                '<output>' + i.qty + '</output>' +
                '<button type="button" data-row="' + n + '" data-step="1" aria-label="One more">+</button>' +
              '</div>' +
              '<button type="button" class="text-button" data-remove="' + n + '">Remove</button>' +
            '</div>' +
          '</div>' +
          '<p class="cart-line">' + kr(itemPrice(i) * i.qty) + '</p>' +
        '</li>';
      }).join('');
      mountPosters(list, true);
      var sub = cartSubtotal();
      var ship = sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING;
      $('[data-sum="subtotal"]', page).textContent = kr(sub);
      $('[data-sum="shipping"]', page).textContent = ship ? kr(ship) : 'Free';
      $('[data-sum="total"]', page).textContent = kr(sub + ship);
      var left = FREE_SHIPPING_FROM - sub;
      $('[data-sum="hint"]', page).textContent = left > 0 ? 'Add ' + kr(left) + ' more for free shipping.' : 'Shipping is on us.';
    }

    list.addEventListener('click', function (ev) {
      var step = ev.target.closest('[data-step]');
      var rem = ev.target.closest('[data-remove]');
      if (step) {
        var i = cart[parseInt(step.getAttribute('data-row'), 10)];
        i.qty = Math.max(1, Math.min(9, i.qty + parseInt(step.getAttribute('data-step'), 10)));
      } else if (rem) {
        cart.splice(parseInt(rem.getAttribute('data-remove'), 10), 1);
      } else return;
      note.hidden = true;
      saveItems(); render();
    });
    $('[data-checkout]', page).addEventListener('click', function () { note.hidden = false; });
    render();
  }

  // Footer and contact details from SITE
  function applySiteDetails() {
    $all('[data-social]').forEach(function (a) {
      var url = SITE[a.getAttribute('data-social')];
      if (url) { a.href = url; a.hidden = false; a.target = '_blank'; a.rel = 'noopener'; }
    });
    $all('[data-follow]').forEach(function (col) { col.hidden = !$('[data-social]:not([hidden])', col); });
    $all('[data-email]').forEach(function (el) {
      if (SITE.email) el.innerHTML = '<a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a>';
    });
  }

  // ---------- Home page ----------
  function initHome() {
    var grid = $('[data-poster-grid]');
    if (!grid) return;

    var parts = POSTERS.map(function (p) { return cardHTML(p, false); });
    if (parts.length > 2) parts.splice(2, 0, PULL_QUOTE);
    grid.innerHTML = parts.join('');

    var strip = $('[data-coll-strip]');
    if (strip) {
      strip.innerHTML = POSTERS.map(function (p) {
        return '<span class="thumb"><span class="poster" data-poster="' + esc(p.id) + '"></span></span>';
      }).join('');
    }

    var note = $('[data-filter-note]');
    var noteName = $('[data-filter-name]');
    var chips = $all('.chip[data-filter]');
    function applyFilter(name) {
      grid.classList.toggle('is-filtered', !!name);
      $all('.card', grid).forEach(function (c) {
        c.hidden = !!name && c.getAttribute('data-collection') !== name;
      });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === name)); });
      if (note) note.hidden = !name;
      if (noteName) noteName.textContent = name || '';
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () { applyFilter(c.getAttribute('data-filter')); });
    });
    var clear = $('[data-filter-clear]');
    if (clear) clear.addEventListener('click', function () { applyFilter(''); });

    var form = $('[data-newsletter]');
    if (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        // Connect this form to your mailing list service (Shopify Email, Klaviyo, Mailchimp …).
        var thanks = $('[data-newsletter-thanks]', form);
        if (thanks) thanks.hidden = false;
        form.reset();
      });
    }
  }

  // ---------- Product page ----------
  function initProduct() {
    var page = $('[data-product-page]');
    if (!page) return;

    var params = new URLSearchParams(window.location.search);
    var poster = find(params.get('p')) || POSTERS[0];
    var st = staging(poster.id);
    var state = { size: '50x70', frame: 'black', qty: 1, view: 'room' };

    document.title = 'Long Lunch — ' + poster.title + ' poster';

    function bind(name, value) { $all('[data-bind="' + name + '"]', page).forEach(function (el) { el.textContent = value; }); }
    bind('title', poster.title);
    bind('collection', poster.collection);
    bind('number', 'No. ' + poster.no);
    bind('tagline', poster.tagline);
    bind('description', poster.description);

    // Three views: on a wall, up close, just the print
    var roomBox = $('[data-room]', page);
    roomBox.outerHTML = sceneHTML(poster.id, { type: 'room', wall: st.roomWall || st.wall, frame: state.frame, rot: st.rot, hang: true, describe: true });
    var closeBox = $('[data-close]', page);
    closeBox.style.setProperty('--fx', st.focus[0] + '%');
    closeBox.style.setProperty('--fy', st.focus[1] + '%');
    closeBox.innerHTML = '<div class="close-art"><div class="poster" data-poster="' + esc(poster.id) + '"></div></div>';
    var flatBox = $('[data-flat]', page);
    flatBox.innerHTML = '<div class="stage"><div class="' + pieceClass(state.frame) + '" data-flat-piece><div class="mat"><div class="poster" data-poster="' + esc(poster.id) + '"></div></div></div><div class="vignette"></div></div>';
    mountPosters(page.querySelector('.viewer'), true);

    function lookAround(ev) {
      var r = closeBox.getBoundingClientRect();
      closeBox.style.setProperty('--fx', Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100)).toFixed(1) + '%');
      closeBox.style.setProperty('--fy', Math.max(0, Math.min(100, (ev.clientY - r.top) / r.height * 100)).toFixed(1) + '%');
    }
    closeBox.addEventListener('pointermove', lookAround);
    closeBox.addEventListener('pointerdown', lookAround);

    var hang = $('[data-hang]', page);
    var flatPiece = $('[data-flat-piece]', page);
    var sizesBox = $('[data-sizes]', page);
    var framesBox = $('[data-frames]', page);
    var status = $('[data-status]', page);
    var caption = $('[data-view-caption]', page);

    function current() {
      var size = SIZES.filter(function (s) { return s.id === state.size; })[0];
      var frame = FRAMES.filter(function (f) { return f.id === state.frame; })[0];
      var unit = frame.id === 'none' ? size.print : size.framed;
      return { size: size, frame: frame, unit: unit, total: unit * state.qty };
    }

    function render() {
      var c = current();
      sizesBox.innerHTML = SIZES.map(function (s) {
        var price = c.frame.id === 'none' ? s.print : s.framed;
        return '<button type="button" class="opt opt-size" data-size="' + s.id + '" aria-pressed="' + (s.id === c.size.id) + '">' +
          '<span class="l">' + s.label + '</span><span class="s">' + s.sub + '</span><span class="p">' + kr(price) + '</span></button>';
      }).join('');
      framesBox.innerHTML = FRAMES.map(function (f) {
        return '<button type="button" class="opt opt-frame" data-frame="' + f.id + '" aria-pressed="' + (f.id === c.frame.id) + '">' +
          '<span class="swatch" style="background:' + f.swatch + '" aria-hidden="true"></span><span>' + f.label + '</span></button>';
      }).join('');

      hang.className = pieceClass(c.frame.id);
      hang.style.width = c.size.width;
      flatPiece.className = pieceClass(c.frame.id);

      var summary = c.size.text + ', ' + c.frame.text;
      if (state.view === 'room') caption.innerHTML = 'Shown at ' + esc(summary) + '. Wall not included.';
      if (state.view === 'close') caption.textContent = canHover ? 'Up close. Move across the picture to look around.' : 'Up close. Tap the picture to look around.';
      if (state.view === 'flat') caption.innerHTML = 'Just the print, ' + esc(summary) + '.';

      bind('price', kr(c.unit));
      bind('shipNote', c.total >= FREE_SHIPPING_FROM ? 'free shipping' : 'shipping ' + kr(SHIPPING));
      bind('qty', String(state.qty));
    }

    sizesBox.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-size]');
      if (!b) return;
      state.size = b.getAttribute('data-size'); status.hidden = true; render();
    });
    framesBox.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-frame]');
      if (!b) return;
      state.frame = b.getAttribute('data-frame'); status.hidden = true; render();
    });
    $all('[data-qty]', page).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = parseInt(b.getAttribute('data-qty'), 10);
        state.qty = Math.max(1, Math.min(9, state.qty + d)); status.hidden = true; render();
      });
    });
    $all('[data-view-btn]', page).forEach(function (b) {
      b.addEventListener('click', function () {
        state.view = b.getAttribute('data-view-btn');
        $all('[data-view-btn]', page).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        $all('[data-view]', page).forEach(function (v) { v.classList.toggle('is-active', v.getAttribute('data-view') === state.view); });
        render();
      });
    });
    $('[data-add]', page).addEventListener('click', function () {
      var c = current();
      addToCart(poster.id, state.size, state.frame, state.qty);
      status.innerHTML = 'Added ' + state.qty + ' × ' + esc(poster.title) + ', ' + esc(c.size.text) + ', ' + esc(c.frame.text) + '. ' +
        '<a href="cart.html">View cart (' + cartCount() + ')</a>';
      status.hidden = false;
    });

    // "Hang it with": the next three posters
    var idx = POSTERS.indexOf(poster), others = [];
    for (var k = 1; k <= 3 && k < POSTERS.length; k++) others.push(POSTERS[(idx + k) % POSTERS.length]);
    $('[data-related]', page).innerHTML = others.map(function (p) { return cardHTML(p, true); }).join('');

    render();
  }

  // ---------- Reveal on scroll ----------
  function initReveal() {
    var els = $all('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- Start ----------
  renderStaticScenes();
  initHome();
  initProduct();
  initCart();
  applySiteDetails();
  mountPosters(document);
  $all('.card .scene').forEach(enableLoupe);
  initReveal();
  showCart();
})();
