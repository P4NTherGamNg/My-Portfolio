(async function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const show = id => ["setup", "login", "app"].forEach(x => $("#" + x).classList.toggle("hidden", x !== id));
  function toast(msg, bad) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "show" + (bad ? " bad" : "");
    clearTimeout(toast.t);
    toast.t = setTimeout(() => (t.className = ""), 3200);
  }

  const cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.projectId || /^PASTE/.test(cfg.projectId)) { show("setup"); return; }

  const base = "https://www.gstatic.com/firebasejs/10.12.2/";
  let fb;
  try {
    const [a, f, au] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-firestore.js"),
      import(base + "firebase-auth.js")
    ]);
    fb = { ...a, ...f, ...au };
  } catch (e) {
    show("setup");
    $("#setup-err").textContent = "Could not load Firebase libraries. Check your internet connection.";
    return;
  }
  const app = fb.initializeApp(cfg);
  const db = fb.getFirestore(app);
  const auth = fb.getAuth(app);
  const CONTENT = () => fb.doc(db, "site", "content");

  /* ---------- Default content (what the site shows before you save anything) ---------- */
  const D = {
    hero: {
      title: "Dumindu Dulanjana",
      text: "ICT student with NVQ Level 4 qualification, currently pursuing Level 5 (Diploma). Passionate about technology, networking, and building digital solutions."
    },
    about: {
      text: "I'm Dumindu Dulanjana, an enthusiastic ICT student from Sri Lanka. I hold an **NVQ Level 4 qualification in ICT** and I'm currently advancing my skills through the **NVQ Level 5 Diploma** program. My coursework has given me hands-on experience in programming, networking basics, system analysis, and web technologies.",
      highlight: "I'm eager to apply my knowledge in real-world projects, collaborate with teams, and continue learning every day. This portfolio is a glimpse into my professional journey."
    },
    contact: { email: "dumindudulanjana999@gmail.com", phone: "+94 76 605 1791", location: "Sri Lanka, Ruwanwella" },
    skills: [
      { icon: "fab fa-html5", name: "HTML & CSS", percent: 85 },
      { icon: "fab fa-js", name: "JavaScript", percent: 65 },
      { icon: "fab fa-python", name: "Python", percent: 60 },
      { icon: "fas fa-network-wired", name: "Networking (Cisco)", percent: 70 },
      { icon: "fas fa-database", name: "MySQL", percent: 65 },
      { icon: "fas fa-wrench", name: "PC Troubleshooting", percent: 80 },
      { icon: "fab fa-java", name: "Java Programming", percent: 70 },
      { icon: "fas fa-diagram-project", name: "System Analysis", percent: 80 }
    ],
    hobbies: [
      { icon: "fas fa-gamepad", name: "Gaming" }, { icon: "fas fa-plane", name: "Traveling" },
      { icon: "fas fa-film", name: "Watching Movies" }, { icon: "fas fa-code", name: "Coding" },
      { icon: "fas fa-music", name: "Music" }, { icon: "fas fa-camera", name: "Photography" },
      { icon: "fas fa-book-open", name: "Learning" }, { icon: "fas fa-robot", name: "AI" }
    ],
    qualifications: [
      { id: "level5", icon: "fa-layer-group", title: "NVQ Level 05", levelTag: "Diploma in ICT · in progress", description: "Advanced diploma focusing on networking, database design, web development, systems analysis.", status: "Started Jan 9, 2026", progressType: "date", startDate: "2026-01-09", endDate: "2027-01-09", progressFixed: 50 },
      { id: "level4", icon: "fa-certificate", title: "NVQ Level 04", levelTag: "ICT · Completed", description: "6-month intensive course covering hardware, operating systems, office applications, and basic programming.", status: "Completed · 2024", progressType: "date", startDate: "2024-01-01", endDate: "2024-07-01", progressFixed: 50 },
      { id: "skills", icon: "fa-code", title: "Core skills", levelTag: "technical toolbox", description: "HTML/CSS, JavaScript basics, Python fundamentals, networking essentials (Cisco), MySQL, and PC troubleshooting.", status: "Always learning", progressType: "none", startDate: "", endDate: "", progressFixed: 50 },
      { id: "english-cert", icon: "fa-language", title: "English Certificate Course", levelTag: "Language Proficiency", description: "Comprehensive English language training covering grammar, speaking, writing, and communication skills. Completed with distinction.", status: "Completed · 2025", progressType: "none", startDate: "", endDate: "", progressFixed: 50 }
    ]
  };

  /* ---------- List editors (skills / hobbies / qualifications) ---------- */
  const ICON = { k: "icon", l: "Icon (Font Awesome class)", ph: "fas fa-star", icon: 1 };
  const SCHEMAS = {
    skills: {
      blank: () => ({ icon: "fas fa-star", name: "", percent: 50 }),
      fields: [ICON, { k: "name", l: "Skill name" }, { k: "percent", l: "Percentage (0–100)", t: "number" }]
    },
    hobbies: {
      blank: () => ({ icon: "fas fa-star", name: "" }),
      fields: [ICON, { k: "name", l: "Hobby name" }]
    },
    qualifications: {
      blank: () => ({ id: "q" + Date.now(), icon: "fa-certificate", title: "", levelTag: "", description: "", status: "", progressType: "none", startDate: "", endDate: "", progressFixed: 50 }),
      fields: [
        ICON,
        { k: "title", l: "Title" },
        { k: "levelTag", l: "Tag line" },
        { k: "status", l: "Status text (e.g. Completed · 2025)" },
        { k: "description", l: "Description", t: "textarea" },
        { k: "progressType", l: "Progress bar", t: "select", o: [["none", "No progress bar"], ["date", "Automatic (from dates)"], ["fixed", "Fixed percentage"]] },
        { k: "startDate", l: "Start date", t: "date", show: i => i.progressType === "date" },
        { k: "endDate", l: "End date", t: "date", show: i => i.progressType === "date" },
        { k: "progressFixed", l: "Percentage (0–100)", t: "number", show: i => i.progressType === "fixed" }
      ]
    }
  };
  let state = {};
  let gallery = [];

  function fieldHTML(f, item) {
    if (f.show && !f.show(item)) return "";
    const v = item[f.k] ?? "";
    let inp;
    if (f.t === "textarea") inp = `<textarea data-k="${f.k}" rows="3">${esc(v)}</textarea>`;
    else if (f.t === "select") inp = `<select data-k="${f.k}">${f.o.map(([val, l]) => `<option value="${val}"${val === v ? " selected" : ""}>${l}</option>`).join("")}</select>`;
    else inp = `<input data-k="${f.k}" type="${f.t || "text"}" value="${esc(v)}"${f.ph ? ` placeholder="${f.ph}"` : ""}${f.t === "number" ? ' min="0" max="100"' : ""}>`;
    const pv = f.icon ? `<span class="pv"><i class="${esc(v)}"></i></span>` : "";
    return `<label class="f${f.t === "textarea" ? " wide" : ""}"><span>${f.l}</span><div class="row">${pv}${inp}</div></label>`;
  }

  function renderList(name) {
    const box = $(`#p-${name} .list`);
    const S = SCHEMAS[name];
    box.innerHTML = state[name].map((item, i) => `
      <div class="item" data-i="${i}">
        <div class="item-head"><b>${esc(item.name || item.title || "New item")}</b>
          <span class="acts">
            <button type="button" data-a="up" title="Move up">↑</button>
            <button type="button" data-a="down" title="Move down">↓</button>
            <button type="button" data-a="del" class="danger" title="Delete">✕</button>
          </span></div>
        <div class="fields">${S.fields.map(f => fieldHTML(f, item)).join("")}</div>
      </div>`).join("") || '<p class="hint" style="color:var(--muted)">Nothing here yet. Click “Add”.</p>';
  }

  ["skills", "hobbies", "qualifications"].forEach(name => {
    const panel = $(`#p-${name}`);
    const list = $(".list", panel);
    list.addEventListener("input", e => {
      const row = e.target.closest(".item"); if (!row || !e.target.dataset.k) return;
      const k = e.target.dataset.k;
      const f = SCHEMAS[name].fields.find(x => x.k === k);
      state[name][+row.dataset.i][k] = f.t === "number" ? e.target.value : e.target.value;
      if (f.icon) $(".pv i", e.target.closest(".row")).className = e.target.value;
      if (k === "name" || k === "title") $(".item-head b", row).textContent = e.target.value || "New item";
    });
    list.addEventListener("change", e => { if (e.target.tagName === "SELECT") renderList(name); });
    list.addEventListener("click", e => {
      const b = e.target.closest("button[data-a]"); if (!b) return;
      const i = +b.closest(".item").dataset.i, arr = state[name];
      if (b.dataset.a === "del") { if (!confirm("Delete this item?")) return; arr.splice(i, 1); }
      else {
        const j = b.dataset.a === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      renderList(name);
    });
    $(`[data-add="${name}"]`, panel).addEventListener("click", () => {
      state[name].push(SCHEMAS[name].blank());
      renderList(name);
      $$(".item", list).pop().scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  function cleanList(name) {
    const num = v => Math.min(100, Math.max(0, Math.round(Number(v) || 0)));
    const icn = v => (/^[\w\- ]+$/.test(v || "") ? v.trim() : "fas fa-star");
    const out = [];
    for (const it of state[name]) {
      if (name === "skills") {
        if (!it.name.trim()) return { err: "Every skill needs a name." };
        out.push({ icon: icn(it.icon), name: it.name.trim(), percent: num(it.percent) });
      } else if (name === "hobbies") {
        if (!it.name.trim()) return { err: "Every hobby needs a name." };
        out.push({ icon: icn(it.icon), name: it.name.trim() });
      } else {
        if (!it.title.trim()) return { err: "Every qualification needs a title." };
        if (it.progressType === "date" && (!it.startDate || !it.endDate)) return { err: `“${it.title}”: set both start and end dates, or change the progress bar type.` };
        out.push({
          id: it.id || "q" + Date.now() + out.length, icon: icn(it.icon).replace(/^fas\s+/, ""),
          title: it.title.trim(), levelTag: (it.levelTag || "").trim(), description: (it.description || "").trim(),
          status: (it.status || "").trim(), progressType: it.progressType || "none",
          startDate: it.startDate || "", endDate: it.endDate || "", progressFixed: num(it.progressFixed)
        });
      }
    }
    return { data: out };
  }

  async function save(obj) {
    try {
      await fb.setDoc(CONTENT(), obj, { merge: true });
      toast("Saved ✓  Refresh your website to see the changes.");
    } catch (e) {
      toast(e.code === "permission-denied" ? "Permission denied – check the admin UID in your Firestore rules." : "Save failed: " + (e.message || e), true);
    }
  }

  const savers = {
    text: () => save({
      hero: { title: $("#t-title").value.trim(), text: $("#t-text").value.trim() },
      about: { text: $("#t-about").value.trim(), highlight: $("#t-highlight").value.trim() }
    }),
    contact: () => {
      const email = $("#c-email").value.trim(), phone = $("#c-phone").value.trim();
      if (!email || !phone) return toast("Email and phone are required.", true);
      return save({ contact: { email, phone, location: $("#c-location").value.trim() } });
    }
  };
  $$("[data-save]").forEach(b => b.addEventListener("click", () => {
    const n = b.dataset.save;
    if (savers[n]) return savers[n]();
    const r = cleanList(n);
    if (r.err) return toast(r.err, true);
    save({ [n]: r.data });
  }));

  /* ---------- Gallery ---------- */
  function resizeImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        let out = "";
        for (const max of [1000, 800, 600, 450]) {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          out = c.toDataURL("image/jpeg", 0.8);
          if (out.length < 800000) break;
        }
        URL.revokeObjectURL(url); res(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Not a valid image")); };
      img.src = url;
    });
  }
  async function loadGallery() {
    const q = await fb.getDocs(fb.query(fb.collection(db, "gallery"), fb.orderBy("order")));
    gallery = q.docs.map(d => ({ id: d.id, ...d.data() }));
    $("#g-grid").innerHTML = gallery.map(g => `
      <div class="g" data-id="${esc(g.id)}"><img src="${esc(g.data)}" alt="${esc(g.alt || "")}">
        <div class="gacts"><button data-a="left" title="Move left">◀</button><button data-a="right" title="Move right">▶</button><button data-a="del" class="danger" title="Delete">✕</button></div>
      </div>`).join("") || '<p class="hint" style="color:var(--muted)">No images yet.</p>';
  }
  const markManaged = () => fb.setDoc(CONTENT(), { galleryManaged: true }, { merge: true });

  $("#g-file").addEventListener("change", async e => {
    const files = [...e.target.files], st = $("#g-status");
    try {
      for (let i = 0; i < files.length; i++) {
        st.textContent = `Uploading ${i + 1} of ${files.length}…`;
        const data = await resizeImage(files[i]);
        await fb.addDoc(fb.collection(db, "gallery"), { data, alt: files[i].name.replace(/\.[^.]+$/, ""), order: Date.now() + i });
      }
      await markManaged();
      st.textContent = "Done ✓";
      toast("Images uploaded ✓");
      await loadGallery();
    } catch (err) {
      st.textContent = "";
      toast(err.code === "permission-denied" ? "Permission denied – check the admin UID in your Firestore rules." : "Upload failed: " + (err.message || err), true);
    }
    e.target.value = "";
  });
  $("#g-grid").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    const id = b.closest(".g").dataset.id, i = gallery.findIndex(g => g.id === id);
    try {
      if (b.dataset.a === "del") {
        if (!confirm("Delete this image?")) return;
        await fb.deleteDoc(fb.doc(db, "gallery", id)); await markManaged();
      } else {
        const j = b.dataset.a === "left" ? i - 1 : i + 1;
        if (j < 0 || j >= gallery.length) return;
        await fb.updateDoc(fb.doc(db, "gallery", gallery[i].id), { order: gallery[j].order });
        await fb.updateDoc(fb.doc(db, "gallery", gallery[j].id), { order: gallery[i].order });
      }
      await loadGallery();
    } catch (err) { toast("Failed: " + (err.message || err), true); }
  });

  /* ---------- Messages (from the website's contact form) ---------- */
  let messages = [];
  async function loadMessages() {
    const box = $("#m-list");
    try {
      const q = await fb.getDocs(fb.query(fb.collection(db, "messages"), fb.orderBy("createdAt", "desc"), fb.limit(200)));
      messages = q.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      box.innerHTML = '<p class="hint" style="color:#fca5a5">Could not load messages: ' + esc(e.message || e) + '<br>Did you publish the updated firestore.rules?</p>';
      return;
    }
    const unread = messages.filter(m => !m.read).length;
    const badge = $("#m-badge");
    badge.textContent = unread; badge.classList.toggle("hidden", !unread);
    box.innerHTML = messages.map(m => {
      const dt = m.createdAt && m.createdAt.toDate ? m.createdAt.toDate().toLocaleString() : "";
      const tel = String(m.phone || "").replace(/\s+/g, "");
      return `<div class="msg${m.read ? "" : " new"}" data-id="${esc(m.id)}">
        <div class="item-head"><b>${esc(m.name)}${m.read ? "" : '<span class="tag">New</span>'}</b><span class="when">${esc(dt)}</span></div>
        <div class="meta"><a href="mailto:${esc(m.email)}">${esc(m.email)}</a>${m.phone ? ` · <a href="tel:${esc(tel)}">${esc(m.phone)}</a>` : ""}</div>
        <p class="body">${esc(m.message)}</p>
        <div class="bar">
          <button class="btn ghost" data-a="read" type="button">${m.read ? "Mark as unread" : "Mark as read"}</button>
          <a class="btn ghost" href="mailto:${esc(m.email)}?subject=${encodeURIComponent("Re: your message")}">Reply</a>
          <button class="btn ghost danger" data-a="del" type="button"><i class="fas fa-trash"></i> Delete</button>
        </div></div>`;
    }).join("") || '<p class="hint" style="color:var(--muted)">No messages yet.</p>';
  }
  $("#m-list").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]"); if (!b) return;
    const id = b.closest(".msg").dataset.id, m = messages.find(x => x.id === id);
    try {
      if (b.dataset.a === "del") {
        if (!confirm("Delete this message permanently?")) return;
        await fb.deleteDoc(fb.doc(db, "messages", id));
      } else {
        await fb.updateDoc(fb.doc(db, "messages", id), { read: !m.read });
      }
      await loadMessages();
    } catch (err) { toast("Failed: " + (err.message || err), true); }
  });
  $("#m-refresh").addEventListener("click", loadMessages);
  $("#m-delread").addEventListener("click", async () => {
    const read = messages.filter(m => m.read);
    if (!read.length) return toast("No read messages to delete.");
    if (!confirm(`Delete ${read.length} read message(s) permanently?`)) return;
    try { for (const m of read) await fb.deleteDoc(fb.doc(db, "messages", m.id)); toast("Deleted ✓"); await loadMessages(); }
    catch (err) { toast("Failed: " + (err.message || err), true); }
  });

  /* ---------- Load everything ---------- */
  async function loadAll() {
    try {
      const s = await fb.getDoc(CONTENT()); const d = s.exists() ? s.data() : {};
      state = {
        hero: { ...D.hero, ...d.hero }, about: { ...D.about, ...d.about }, contact: { ...D.contact, ...d.contact },
        skills: clone(d.skills || D.skills), hobbies: clone(d.hobbies || D.hobbies), qualifications: clone(d.qualifications || D.qualifications)
      };
      $("#t-title").value = state.hero.title; $("#t-text").value = state.hero.text;
      $("#t-about").value = state.about.text; $("#t-highlight").value = state.about.highlight;
      $("#c-email").value = state.contact.email; $("#c-phone").value = state.contact.phone; $("#c-location").value = state.contact.location;
      ["skills", "hobbies", "qualifications"].forEach(renderList);
      await loadGallery();
      await loadMessages();
    } catch (e) {
      toast("Could not load data: " + (e.message || e), true);
    }
  }

  /* ---------- Tabs, login, logout ---------- */
  $("#tabs").addEventListener("click", e => {
    const b = e.target.closest("button[data-t]"); if (!b) return;
    $$("#tabs button").forEach(x => x.classList.toggle("on", x === b));
    $$(".panel").forEach(p => p.classList.toggle("on", p.id === "p-" + b.dataset.t));
  });
  $("#login-form").addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("#login-err"); err.textContent = "";
    try { await fb.signInWithEmailAndPassword(auth, $("#l-email").value.trim(), $("#l-pass").value); }
    catch (ex) {
      const m = { "auth/invalid-credential": "Wrong email or password.", "auth/invalid-email": "Enter a valid email.", "auth/too-many-requests": "Too many attempts. Try again later.", "auth/network-request-failed": "Network problem. Check your connection." };
      err.textContent = m[ex.code] || "Login failed: " + (ex.code || ex.message);
    }
  });
  $("#logout").addEventListener("click", () => fb.signOut(auth));
  fb.onAuthStateChanged(auth, u => {
    if (u) { $("#who").textContent = u.email; show("app"); loadAll(); }
    else { $("#l-pass").value = ""; show("login"); }
  });
})();
