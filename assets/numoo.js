/* numoo \u2014 shared shell, demo data and page behaviour.
   Concept prototype: no network, no real money, fictional records. */
(function () {
  "use strict";

  /* ---------------- storage (never load-bearing) ---------------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("numoo." + k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("numoo." + k, v); } catch (e) {} }
  };

  /* ---------------- helpers ---------------- */
  function money(n, dp) {
    return "AED " + Number(n).toLocaleString("en-AE", { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 });
  }
  function plain(n) { return Number(n).toLocaleString("en-AE"); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function qs(s, r) { return (r || document).querySelector(s); }
  function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------------- demo data ---------------- */
  var NOW = Date.now();
  var H = 3600000;

  var CASES = [
    { id: "EDU-024", title: "Two terms to keep a Grade 9 student enrolled", photo: "img/classroom.webp", need: 18000, raised: 12500, grade: "Grade 9", emirate: "Sharjah", type: "Tuition", school: "Private school, moderate fee band", term: "Term 2 and Term 3, 2026/27", donors: 38, days: 11,
      summary: "A single-income household lost its second salary in August. Two terms of tuition are outstanding and the school has paused the re-enrolment.",
      detail: "The school confirmed the outstanding balance and agreed a goodwill discount of AED 2,000. The committee verified household income, tenancy and the fee invoice on 14 October. No part of this amount is paid to the family; the balance is settled directly with the school finance office.",
      fee: [["School invoice, two terms", 20000], ["School goodwill discount", -2000]], flags: ["School verified", "Committee approved", "Identity withheld"] },
    { id: "EDU-031", title: "Get a Grade 4 pupil back on the school bus", photo: "img/bus.webp", need: 9400, raised: 2100, grade: "Grade 4", emirate: "Ajman", type: "Tuition and transport", school: "Private school, low fee band", term: "Term 2, 2026/27", donors: 9, days: 19,
      summary: "Father's visa transfer left a four-month gap in income. The school bus contract lapsed and the child has missed eleven days.",
      detail: "Transport is funded separately from tuition and is paid to the school's contracted operator. The committee capped transport support at one term pending a review of the household's new employment.",
      fee: [["Tuition, one term", 7200], ["School transport, one term", 2200]], flags: ["School verified", "Committee approved", "Identity withheld"] },
    { id: "EDU-033", title: "Exam entry for a Grade 11 student", photo: "img/exam.webp", need: 6500, raised: 6500, grade: "Grade 11", emirate: "Dubai", type: "Examination fees", school: "Private school, high fee band", term: "External examinations, May 2027", donors: 24, days: 0,
      summary: "External examination entries were due before a parent's insurance claim settled. Missing the entry window would cost the student a full year.",
      detail: "Fully funded on 28 October. The examination board invoice was settled directly on 30 October and the entry is confirmed.",
      fee: [["Examination entry, six subjects", 6500]], flags: ["School verified", "Paid to school", "Identity withheld"], done: true },
    { id: "EDU-035", title: "A guardian raising two nephews needs one more term", photo: "img/father.webp", need: 14200, raised: 4800, grade: "Grade 7", emirate: "Ras Al Khaimah", type: "Tuition", school: "Private school, moderate fee band", term: "Term 2 and Term 3, 2026/27", donors: 14, days: 24,
      summary: "A guardian is raising two nephews after a bereavement. One child's fees are covered by a relative; the second has no sponsor.",
      detail: "Guardianship was verified through documentation held by the charity. The committee reconciled an existing partial scholarship of AED 3,800 before setting the published target.",
      fee: [["School invoice, two terms", 18000], ["Existing school scholarship", -3800]], flags: ["School verified", "Committee approved", "Identity withheld"] },
    { id: "EDU-038", title: "Books, uniform and a device for Grade 2", photo: "img/supplies.webp", need: 3600, raised: 900, grade: "Grade 2", emirate: "Fujairah", type: "Books and uniform", school: "Private school, low fee band", term: "2026/27", donors: 6, days: 27,
      summary: "Tuition is covered by a government scheme, but books, uniform and the device deposit are not. The class has moved to a digital textbook.",
      detail: "Supplied against the school's own itemised list. Items are issued by the school, not purchased by the family.",
      fee: [["Digital textbook licences", 1400], ["Uniform, two sets", 900], ["Device deposit", 1300]], flags: ["School verified", "Committee approved", "Identity withheld"] },
    { id: "EDU-039", title: "Finish the final year without a transfer", photo: "img/walk.webp", need: 21500, raised: 15900, grade: "Grade 12", emirate: "Sharjah", type: "Tuition", school: "Private school, high fee band", term: "Final year, 2026/27", donors: 51, days: 8,
      summary: "A final-year student faces a transfer in the examination year after a parent's long illness reduced household income.",
      detail: "The committee prioritised continuity: a transfer in the final year would require a different curriculum. The school agreed to hold the place for 45 days while funding is raised.",
      fee: [["School invoice, remaining terms", 24000], ["School goodwill discount", -2500]], flags: ["School verified", "Committee approved", "Place held to 15 Dec"] }
  ];

  var LOTS = [
    { id: "A-018", title: "Leather handbag, structured tote", cat: "bag", condition: "Very good", est: [1800, 2600], reserve: 1800, bid: 2200, bids: 14, ends: NOW + 31 * H, fund: "Education Fund",
      note: "Minor corner wear disclosed. Dust bag included. No authenticity card supplied; assessed on construction and hardware.",
      auth: { by: "Independent leather-goods specialist", date: "26 Oct 2026", method: "Physical inspection, hardware and stitch analysis", result: "Consistent with maker's construction", limits: "Opinion on construction only. Serial records were not available to the specialist." } },
    { id: "A-021", title: "Men's automatic watch, steel case", cat: "watch", condition: "Good, service due", est: [4200, 5800], reserve: 4200, bid: 4650, bids: 22, ends: NOW + 7 * H, fund: "Education Fund",
      note: "Running at time of inspection. Service history unknown; a service is recommended and is the buyer's cost. Bracelet has two spare links.",
      auth: { by: "Independent horologist", date: "22 Oct 2026", method: "Case-back opening, movement and serial check", result: "Movement and case consistent and matched", limits: "Water resistance was not tested and is not warranted." } },
    { id: "A-024", title: "Fountain pen, lacquer barrel", cat: "pen", condition: "Excellent", est: [900, 1400], reserve: 900, bid: 1050, bids: 8, ends: NOW + 52 * H, fund: "Education Fund",
      note: "Nib writes cleanly. Original box and converter present. Light handling marks on the cap band.",
      auth: { by: "Specialist dealer assessment", date: "28 Oct 2026", method: "Nib, imprint and finish inspection", result: "Consistent with maker's production", limits: "No service records available." } },
    { id: "A-026", title: "Gold-tone bangle set, three pieces", cat: "jewel", condition: "Very good", est: [2400, 3200], reserve: 2600, bid: 2400, bids: 5, ends: NOW + 19 * H, fund: "Case EDU-039",
      note: "Donor nominated a specific case. Sold as a set of three. Metal assay certificate supplied by the donor and reproduced in the lot report.",
      auth: { by: "Assay laboratory report, donor supplied", date: "19 Oct 2026", method: "Documented assay", result: "Metal content as stated on the certificate", limits: "Certificate accepted as supplied; the charity did not commission its own assay." } },
    { id: "A-029", title: "Rangefinder camera with 50mm lens", cat: "camera", condition: "Good, cosmetic wear", est: [3100, 4000], reserve: 3100, bid: 0, bids: 0, ends: NOW + 70 * H, fund: "Education Fund",
      note: "Shutter fires at all speeds by ear. Light seals replaced. Lens has light cleaning marks that do not affect images at normal apertures.",
      auth: { by: "Camera technician assessment", date: "30 Oct 2026", method: "Mechanical function check and lens inspection", result: "Functioning, cosmetically worn", limits: "No film test was carried out." } },
    { id: "A-030", title: "Hand-thrown ceramic vessel, signed", cat: "ceramic", condition: "Excellent", est: [1200, 1800], reserve: 1200, bid: 1300, bids: 4, ends: NOW + 44 * H, fund: "Education Fund",
      note: "Signed on the foot. No restoration or hairlines found under inspection light.",
      auth: { by: "Studio-ceramics specialist", date: "29 Oct 2026", method: "Visual and ultraviolet inspection", result: "No restoration detected", limits: "Attribution rests on the signature alone." } }
  ];

  var IMPACT = {
    students: 412, disbursed: 3184500, schools: 61, lots: 148, lotProceeds: 612300,
    onTime: 96, adminRatio: 7.4, cases: 437, median: 9
  };

  /* ---------------- icons (stroke, 24 grid) ---------------- */
  var ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowup: '<path d="M7 17 17 7M8 7h9v9"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    school: '<path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M7 12.5V17c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"/><path d="M21 10v5"/>',
    heart: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    gavel: '<path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m16 16 6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5V8Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18M7 6h1v4M16.7 13.9l.7.7-2.8 2.8"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    truck: '<path d="M10 17h4V5H2v12h3M14 9h4l4 4v4h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    badge: '<path d="M12 2 15 5h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V5h4Z"/><path d="m9 12 2 2 4-4"/>',
    apple: '<path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7a4.5 4.5 0 0 0-3.5-1.9c-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8A4.7 4.7 0 0 0 4.2 9.5c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7 4.2 4.2 0 0 1-2.5-4ZM14 5.4a4.3 4.3 0 0 0 1-3.1 4.4 4.4 0 0 0-2.9 1.5 4.1 4.1 0 0 0-1 3 3.6 3.6 0 0 0 2.9-1.4Z" fill="currentColor" stroke="none"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
    x: '<path d="M4 4l16 16M20 4 4 20"/>',
    in: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'
  };
  function icon(name, size, sw) {
    return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + '</svg>';
  }
  var ARR = '<span class="arr">' + icon("arrowup", 14, 2.4) + '</span>';

  /* ---------------- generative case sigil ---------------- */
  function sigil(seed, cls) {
    var h = hash(seed), r = function (n) { h = (h * 1103515245 + 12345) >>> 0; return h % n; };
    var rot = r(180), skew = r(14) - 7, spin = 14 + r(16);
    var hues = [["var(--brand)", "var(--cyan)"], ["var(--cyan)", "var(--brand)"], ["var(--brand)", "var(--gold-bright)"], ["var(--cyan)", "var(--gold-bright)"]][hash(seed) % 4];
    var o = '<svg class="sigil ' + (cls || "") + '" viewBox="0 0 100 100" role="img" aria-label="Reference mark for case ' + esc(seed) + '"><rect width="100" height="100" fill="var(--brand-wash)"/><g fill="none" stroke-linecap="round">';
    for (var i = 0; i < 5; i++) {
      var k = 16 + i * 7, v = 10 + i * 5 + skew;
      o += '<path transform="rotate(' + (rot + i * spin) + ' 50 50)" d="M' + (50 - k) + ' 50 C' + (50 - k) + ' ' + (50 - v) + ',' + (50 + k) + ' ' + (50 + v) + ',' + (50 + k) + ' 50 C' +
        (50 + k) + ' ' + (50 - v) + ',' + (50 - k) + ' ' + (50 + v) + ',' + (50 - k) + ' 50 Z" stroke="' + (i % 2 ? hues[1] : hues[0]) + '" stroke-width="' + (3.4 - i * 0.35) + '" opacity="' + (1 - i * 0.14).toFixed(2) + '"/>';
    }
    return o + '</g></svg>';
  }

  /* ---------------- lot photography ---------------- */
  function artwork(cat, seed, alt) {
    return '<img src="img/' + (cat || "bag") + '.webp" alt="' + esc(alt || "Catalogue photograph of the lot") + '" loading="lazy">';
  }

  /* ---------------- shared card renderers ---------------- */
  function caseCard(c) {
    var p = Math.round(c.raised / c.need * 100);
    return '<a class="casecard" href="case.html">' +
      '<div class="casecard__fig zoom"><img src="' + c.photo + '" alt="" loading="lazy">' +
      '<div class="photo__tl"><span class="chip chip--glass">' + c.type + '</span>' +
      (c.done ? '<span class="chip chip--good">Paid to school</span>' : (c.days <= 12 ? '<span class="chip chip--dark"><span class="chip__dot"></span>' + c.days + ' days left</span>' : '')) + '</div>' +
      '<span class="photo__tr roundarrow">' + icon("arrowup", 18, 2.2) + '</span></div>' +
      '<div class="casecard__body">' +
      '<span class="verified">' + icon("badge", 16, 2) + 'Verified by the committee \u00b7 <span class="num">' + c.id + '</span></span>' +
      '<span class="h3">' + c.title + '</span>' +
      '<span class="xs mute-3">' + c.grade + ' \u00b7 ' + c.emirate + '</span>' +
      '<div class="meter" style="margin-block-start:auto"><div class="meter__track"><div class="meter__fill" data-fill="' + p + '" style="inline-size:0"></div></div>' +
      '<div class="meter__legend"><span><span class="amount">' + money(c.raised) + '</span> <span class="mute-3">of ' + money(c.need) + '</span></span>' +
      '<span class="amount" style="color:var(--brand)">' + p + '%</span></div></div></div></a>';
  }
  function lotCard(l) {
    var met = l.bid >= l.reserve;
    return '<a class="lotcard" href="lot.html">' +
      '<div class="lotcard__fig zoom">' + artwork(l.cat, l.id, l.title) +
      '<span class="ribbon chip chip--glass">Lot ' + l.id + '</span>' +
      '<span class="timer">' + icon("clock", 14, 2.2) + '<span class="countdown" data-ends="' + l.ends + '"></span></span>' +
      '<span class="photo__tr roundarrow">' + icon("arrowup", 18, 2.2) + '</span></div>' +
      '<div class="lotcard__body"><span class="h3">' + l.title + '</span>' +
      '<span class="xs mute-3">' + l.condition + ' \u00b7 est. ' + money(l.est[0]) + '\u2013' + plain(l.est[1]) + '</span>' +
      '<div class="row-between" style="margin-block-start:auto;align-items:end;padding-block-start:6px">' +
      '<span class="stack" style="gap:2px"><span class="xs mute-3">' + (l.bid ? "Current bid" : "Opening bid") + '</span>' +
      '<span class="amount amount--lg">' + money(l.bid || l.reserve) + '</span></span>' +
      '<span class="chip ' + (l.bid ? (met ? "chip--good" : "chip--warn") : "") + '">' + (l.bid ? l.bids + " bids \u00b7 " + (met ? "reserve met" : "below reserve") : "No bids yet") + '</span></div>' +
      '</div></a>';
  }
  function trailHTML(rows) {
    return rows.map(function (t, i) {
      return '<div class="trail__step" data-state="' + t[3] + '"><div class="trail__dot">' + (t[3] === "done" ? icon("check", 16, 3) : i + 1) + '</div>' +
        '<div class="stack stack-2"><div class="trail__head"><strong class="sm">' + t[0] + '</strong><span class="xs mute-3 num">' + t[1] + '</span></div>' +
        '<span class="xs muted">' + t[2] + '</span></div></div>';
    }).join("");
  }

  /* ---------------- the lemniscate diagram ---------------- */
  function loopDiagram() {
    var d = "M300 90 C222 90 190 150 120 150 C62 150 40 118 40 90 C40 62 62 30 120 30 C190 30 222 90 300 90 C378 90 410 30 480 30 C538 30 560 62 560 90 C560 118 538 150 480 150 C410 150 378 90 300 90 Z";
    function node(x, y, label) {
      var a = x < 300 ? "end" : "start", dx = x < 300 ? -18 : 18;
      return '<circle cx="' + x + '" cy="' + y + '" r="8"/><text x="' + (x + dx) + '" y="' + y + '" dy="5" text-anchor="' + a + '">' + label + '</text>';
    }
    return '<div class="loop"><div class="loop__scroll">' +
      '<svg viewBox="-160 -40 920 240" role="img" aria-label="Two giving circuits meet at one point: money from donors and proceeds from donated items, both paid directly to the school.">' +
      '<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1A8CFF"/><stop offset=".5" stop-color="#28C1DE"/><stop offset="1" stop-color="#E3A93B"/></linearGradient>' +
      '<filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<path class="path trace" filter="url(#glow)" style="--len:1500;stroke:url(#lg)" d="' + d + '"/>' +
      '<g class="node">' + node(120, 150, "Donor gives") + node(40, 90, "Case published") + node(120, 30, "Committee verifies") +
      node(480, 30, "Item authenticated") + node(560, 90, "Lot sold") + node(480, 150, "Item donated") + '</g>' +
      '<circle cx="300" cy="90" r="13" class="cross"/><path class="leader" d="M300 -6v80"/>' +
      '<text class="crosslabel" x="300" y="-16" text-anchor="middle">School is paid directly</text></svg></div>' +
      '<p class="sm center" style="max-width:48ch;margin-inline:auto;margin-block-start:10px">Both circuits settle at one point, against a verified school invoice. Neither ever pays a family account.</p></div>';
  }

  /* ---------------- site chrome ---------------- */
  var NAV = [
    ["cases.html", "Cases", "\u0627\u0644\u062d\u0627\u0644\u0627\u062a"],
    ["auctions.html", "Auctions", "\u0627\u0644\u0645\u0632\u0627\u062f\u0627\u062a"],
    ["give-item.html", "Give an item", "\u062a\u0628\u0631\u0651\u0639 \u0628\u0642\u0637\u0639\u0629"],
    ["how-it-works.html", "How it works", "\u0643\u064a\u0641 \u062a\u0639\u0645\u0644"],
    ["impact.html", "Impact", "\u0627\u0644\u0623\u062b\u0631"],
    ["corporate.html", "Companies", "\u0627\u0644\u0634\u0631\u0643\u0627\u062a"]
  ];

  function chrome() {
    var page = (location.pathname.split("/").pop() || "index.html");
    var hdr = qs("#hdr"), ftr = qs("#ftr");
    if (hdr) {
      hdr.className = "hdr";
      hdr.innerHTML =
        '<div class="hdr__in">' +
        '<a class="mark" href="index.html" aria-label="numoo home"><span class="mark__img"></span></a>' +
        '<nav class="nav" id="nav" aria-label="Main">' +
        NAV.map(function (n) {
          return '<a href="' + n[0] + '"' + (n[0] === page ? ' aria-current="page"' : "") + ' data-en="' + n[1] + '" data-ar="' + n[2] + '">' + n[1] + '</a>';
        }).join("") +
        '<a href="apply.html" class="btn btn--line navcta" data-en="Apply for support" data-ar="\u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628 \u062f\u0639\u0645">Apply for support</a>' +
        '<a href="login.html" class="btn btn--line navcta" data-en="Sign in" data-ar="\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644">Sign in</a>' +
        '<a href="my-numoo.html" class="btn btn--dark navcta" data-en="My numoo" data-ar="\u062d\u0633\u0627\u0628\u064a">My numoo</a>' +
        '</nav>' +
        '<div class="hdr__tools">' +
        '<div class="langtog" role="group" aria-label="Language"><button type="button" data-lang="en" aria-pressed="true">EN</button><button type="button" data-lang="ar" aria-pressed="false">\u0639</button></div>' +
        '<button class="iconbtn" id="themebtn" type="button" aria-label="Switch colour theme"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg></button>' +
        '<a class="iconbtn" href="login.html" aria-label="Sign in" title="Sign in"' + (page === "login.html" ? ' aria-current="page"' : '') + '>' + icon("user", 18) + '</a>' +
        '<a class="btn btn--line btn--sm hdr-apply" href="apply.html"' + (page === "apply.html" ? ' aria-current="page"' : '') + ' data-en="Apply for support" data-ar="\u062a\u0642\u062f\u064a\u0645 \u0637\u0644\u0628">Apply for support</a>' +
        '<a class="btn btn--primary btn--sm" href="cases.html" data-en="Donate" data-ar="\u062a\u0628\u0631\u0651\u0639">Donate</a>' +
        '<button class="iconbtn burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>' +
        '</div></div>';
      var scrim = el("div", "scrim"); document.body.appendChild(scrim);
      var nav = qs("#nav"), burger = qs("#burger");
      function setMenu(o) { nav.dataset.open = o; scrim.dataset.open = o; burger.setAttribute("aria-expanded", o); document.body.style.overflow = o === "true" ? "hidden" : ""; }
      burger.addEventListener("click", function () { setMenu(nav.dataset.open === "true" ? "false" : "true"); });
      scrim.addEventListener("click", function () { setMenu("false"); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu("false"); });
      var onScroll = function () { hdr.dataset.scrolled = window.scrollY > 8 ? "true" : "false"; };
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
    if (ftr) {
      ftr.className = "ftr";
      ftr.innerHTML = '<div class="shell"><div class="ftr__card"><div class="glowbg glowbg--a" style="inset-block-start:-320px;inset-inline-end:-200px;opacity:.35"></div>' +
        '<div class="ftr__grid">' +
        '<div class="stack stack-5"><span class="ftr__mark"></span>' +
        '<p class="sm" style="max-width:36ch">Verified education support and curated charity auctions for families in the UAE. Every dirham is paid to a school, never to an account.</p>' +
        '<form class="newsletter" onsubmit="event.preventDefault();this.querySelector(\'button\').textContent=\'Subscribed\'"><label class="sr" for="nl">Email</label><input id="nl" type="email" placeholder="Your email for impact updates"><button class="btn btn--white btn--sm" type="submit">Subscribe</button></form></div>' +
        fcol("Give", [["cases.html", "Browse cases"], ["auctions.html", "Live auctions"], ["give-item.html", "Donate an item"], ["corporate.html", "Corporate giving"]]) +
        fcol("Get support", [["apply.html", "Apply for support"], ["how-it-works.html", "How it works"], ["trust.html", "Privacy and dignity"], ["login.html", "Sign in or create account"], ["my-numoo.html", "My numoo"]]) +
        fcol("Accountability", [["impact.html", "Impact report"], ["trust.html", "How money is handled"], ["workspace.html", "Staff workspace"], ["design.html", "Design system"]]) +
        '</div><div class="ftr__base"><span>Operated by Tarahum Charity Foundation. numoo is the technology platform. Concept prototype with fictional data.</span>' +
        '<div class="social"><a href="#" aria-label="Instagram">' + icon("ig", 15) + 'Instagram</a><a href="#" aria-label="X">' + icon("x", 15) + 'X</a><a href="#" aria-label="LinkedIn">' + icon("in", 15) + 'LinkedIn</a></div></div></div></div>';
    }
    function fcol(h, links) {
      return '<div><h4>' + h + '</h4><ul>' + links.map(function (l) { return '<li><a href="' + l[0] + '">' + l[1] + '</a></li>'; }).join("") + '</ul></div>';
    }
  }

  /* ---------------- theme + language ---------------- */
  function theme() {
    var saved = store.get("theme", "");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    var b = qs("#themebtn"); if (!b) return;
    b.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme");
      if (!cur) cur = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next); store.set("theme", next);
    });
  }
  function language() {
    function apply(lang) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      qsa("[data-en]").forEach(function (n) { n.innerHTML = n.getAttribute("data-" + lang) || n.getAttribute("data-en"); });
      qsa(".langtog button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === lang); });
      var note = qs("#langnote"); if (note) note.hidden = lang !== "ar";
      store.set("lang", lang);
    }
    qsa(".langtog button").forEach(function (b) { b.addEventListener("click", function () { apply(b.dataset.lang); }); });
    if (store.get("lang", "en") === "ar") apply("ar");
  }

  /* ---------------- behaviours ---------------- */
  var ticking = false;
  function countdowns() {
    function tick() {
      qsa("[data-ends]").forEach(function (n) {
        var ms = Number(n.dataset.ends) - Date.now();
        if (!n.dataset.ends || isNaN(ms)) return;
        if (ms <= 0) { n.textContent = "Closed"; n.dataset.urgent = "true"; return; }
        var d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
        n.textContent = (d ? d + "d " : "") + String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        n.dataset.urgent = ms < 12 * H ? "true" : "false";
      });
    }
    tick(); if (!ticking) { ticking = true; setInterval(tick, 1000); }
  }
  function meters() {
    qsa("[data-fill]").forEach(function (n) {
      var pct = Math.min(100, Number(n.dataset.fill));
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { n.style.inlineSize = pct + "%"; return; }
      requestAnimationFrame(function () { setTimeout(function () { n.style.inlineSize = pct + "%"; }, 80); });
    });
  }
  function counters() {
    qsa("[data-count]").forEach(function (n) {
      if (n.dataset.done) return; n.dataset.done = "1";
      var target = Number(n.dataset.count), prefix = n.dataset.prefix || "", suffix = n.dataset.suffix || "";
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { n.textContent = prefix + plain(target) + suffix; return; }
      var t0 = null, dur = 1600;
      function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        n.textContent = prefix + plain(Math.round(target * e)) + suffix; if (k < 1) requestAnimationFrame(step); }
      n.textContent = prefix + plain(target) + suffix;
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); requestAnimationFrame(step); } }); });
        io.observe(n);
      }
    });
  }
  function tabs() {
    qsa("[data-tabs]").forEach(function (group) {
      var btns = qsa("button", group);
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.setAttribute("aria-selected", "false"); });
          b.setAttribute("aria-selected", "true");
          qsa("[data-panel]").forEach(function (p) { if (p.dataset.group === group.dataset.tabs) p.hidden = p.dataset.panel !== b.dataset.target; });
        });
      });
    });
  }
  function wizard(root) {
    var steps = qsa("[data-step]", root), pips = qsa("[data-pip]", root), i = 0;
    function show(n) {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      pips.forEach(function (p, k) { p.dataset.state = k < i ? "done" : k === i ? "current" : "todo"; });
      var top = root.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    qsa("[data-next]", root).forEach(function (b) { b.addEventListener("click", function () { show(i + 1); }); });
    qsa("[data-prev]", root).forEach(function (b) { b.addEventListener("click", function () { show(i - 1); }); });
    show(0);
  }

  window.NUMOO = {
    CASES: CASES, LOTS: LOTS, IMPACT: IMPACT, money: money, plain: plain, esc: esc, el: el, qs: qs, qsa: qsa,
    sigil: sigil, artwork: artwork, icon: icon, ARR: ARR, caseCard: caseCard, lotCard: lotCard, trailHTML: trailHTML,
    loopDiagram: loopDiagram, wizard: wizard,
    caseById: function (id) { return CASES.filter(function (c) { return c.id === id; })[0]; },
    lotById: function (id) { return LOTS.filter(function (l) { return l.id === id; })[0]; },
    refresh: function () { countdowns(); meters(); counters(); }
  };

  function boot() {
    chrome(); theme(); tabs();
    if (typeof window.pageInit === "function") window.pageInit();
    qsa("[data-icon]").forEach(function (n) { n.innerHTML = icon(n.dataset.icon, Number(n.dataset.size) || 22); });
    countdowns(); meters(); counters(); language();
    qsa("[data-wizard]").forEach(wizard);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
