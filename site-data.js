/* Loads content saved from admin.html (Firestore) and swaps it into the page.
   If Firebase is not configured or fails, the built-in HTML content stays as it is. */
(async function () {
  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId || /^PASTE/.test(cfg.projectId)) return;
  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r));
  }

  const base = "https://www.gstatic.com/firebasejs/10.12.2/";
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const icon = s => (/^[\w\- ]+$/.test(s || "") ? s : "fas fa-star");
  const pct = n => Math.min(100, Math.max(0, Number(n) || 0));

  try {
    const { initializeApp } = await import(base + "firebase-app.js");
    const { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } = await import(base + "firebase-firestore.js");
    const db = getFirestore(initializeApp(cfg));

    const snap = await getDoc(doc(db, "site", "content"));
    if (!snap.exists()) return;
    const c = snap.data();

    // Hero + About text
    if (c.hero) {
      if (c.hero.title) $(".hero-content h1").textContent = c.hero.title;
      if (c.hero.text) $(".hero-content p").textContent = c.hero.text;
    }
    if (c.about) {
      if (c.about.text) $(".about-text > p").innerHTML = fmt(c.about.text);
      if (c.about.highlight) {
        $(".about-highlight").innerHTML = '<i class="fas fa-check-circle" style="color:#2563eb;"></i> ' + esc(c.about.highlight);
      }
    }

    // Contact details
    if (c.contact) {
      const k = c.contact;
      if (k.email) document.querySelectorAll('a[href^="mailto:"]').forEach(a => { a.href = "mailto:" + k.email; a.textContent = k.email; });
      if (k.phone) document.querySelectorAll('a[href^="tel:"]').forEach(a => { a.href = "tel:" + k.phone.replace(/\s+/g, ""); a.textContent = k.phone; });
      if (k.location) { const p = $("#contact .contact-card-content p"); if (p) p.textContent = k.location; }
      const f = $("#footer-contact");
      if (f && k.email && k.phone) f.innerHTML = '<i class="fas fa-envelope"></i> ' + esc(k.email) + ' &nbsp;|&nbsp; <i class="fas fa-phone"></i> ' + esc(k.phone);
      const qr = $(".qr-card img");
      if (qr && k.email && k.phone) {
        const name = (c.hero && c.hero.title) || "Dumindu Dulanjana";
        const v = "BEGIN:VCARD\nVERSION:3.0\nFN:" + name + "\nEMAIL:" + k.email + "\nTEL:" + k.phone.replace(/\s+/g, "") + "\nEND:VCARD";
        qr.src = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" + encodeURIComponent(v);
      }
    }

    // Skills
    if (Array.isArray(c.skills)) {
      $(".skills-grid").innerHTML = c.skills.map(s => {
        const p = pct(s.percent);
        return '<div class="skill-card"><div class="skill-top"><div class="skill-icon"><i class="' + icon(s.icon) + '"></i></div>' +
          '<span class="skill-name">' + esc(s.name) + '</span><span class="skill-percent">' + p + '%</span></div>' +
          '<div class="skill-bar"><div class="skill-fill" style="--p:' + p + '%;"></div></div></div>';
      }).join("");
    }

    // Hobbies
    if (Array.isArray(c.hobbies)) {
      $(".hobby-grid").innerHTML = c.hobbies.map(h =>
        '<div class="hobby-card"><i class="' + icon(h.icon) + '"></i><span>' + esc(h.name) + '</span></div>').join("");
    }

    // Qualifications (rendered by script.js)
    if (Array.isArray(c.qualifications) && window.setQualifications) window.setQualifications(c.qualifications);

    // Gallery images (stored as small compressed images in the "gallery" collection)
    if (c.galleryManaged) {
      const gs = await getDocs(query(collection(db, "gallery"), orderBy("order")));
      $(".gallery-grid").innerHTML = gs.docs.map(d => {
        const g = d.data();
        return '<figure class="gallery-item"><img src="' + esc(g.data) + '" alt="' + esc(g.alt || "Gallery image") + '" loading="lazy"></figure>';
      }).join("");
    }
  } catch (e) {
    console.warn("Firebase content not loaded – showing built-in content.", e);
  }
})();
