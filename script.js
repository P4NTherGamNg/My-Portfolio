document.addEventListener('DOMContentLoaded', () => {
  // ========================
  // Smooth scroll for anchor links
  // ========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ========================
  // Qualifications (defaults; replaced by admin-panel data from Firestore)
  // ========================
  const defaultQualifications = [
    {
      id: 'level5',
      title: 'NVQ Level 05',
      levelTag: 'Diploma in ICT · in progress',
      description: 'Advanced diploma focusing on networking, database design, web development, systems analysis.',
      status: 'Started Jan 9, 2026',
      icon: 'fa-layer-group',
      progressType: 'date',
      startDate: '2026-01-09',
      endDate: '2027-01-09',
      noProgress: false,
      createdAt: 0,
      updatedAt: 0
    },
    {
      id: 'level4',
      title: 'NVQ Level 04',
      levelTag: 'ICT · Completed',
      description: '6-month intensive course covering hardware, operating systems, office applications, and basic programming.',
      status: 'Completed · 2024',
      icon: 'fa-certificate',
      progressType: 'date',
      startDate: '2024-01-01',
      endDate: '2024-07-01',
      noProgress: false,
      createdAt: 0,
      updatedAt: 0
    },
    {
      id: 'skills',
      title: 'Core skills',
      levelTag: 'technical toolbox',
      description: 'HTML/CSS, JavaScript basics, Python fundamentals, networking essentials (Cisco), MySQL, and PC troubleshooting.',
      status: 'Always learning',
      icon: 'fa-code',
      progressType: 'none',
      noProgress: true,
      createdAt: 0,
      updatedAt: 0
    },
    {
      id: 'english-cert',
      title: 'English Certificate Course',
      levelTag: 'Language Proficiency',
      description: 'Comprehensive English language training covering grammar, speaking, writing, and communication skills. Completed with distinction.',
      status: 'Completed · 2025',
      icon: 'fa-language',
      progressType: 'none',
      noProgress: true,
      createdAt: 0,
      updatedAt: 0
    }
  ];

  let currentQuals = defaultQualifications;
  function loadQualifications() {
    return currentQuals;
  }

  function calculateProgress(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (now < start) return 0;
    if (now > end) return 100;
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  }

  function renderQualifications(containerId) {
    const quals = loadQualifications();
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    quals.forEach(qual => {
      const card = document.createElement('div');
      card.className = 'qual-card';
      card.dataset.id = qual.id;

      const iconDiv = document.createElement('div');
      iconDiv.className = 'card-icon';
      iconDiv.innerHTML = `<i class="fas ${qual.icon}"></i>`;

      const title = document.createElement('h3');
      title.textContent = qual.title;

      const levelTag = document.createElement('span');
      levelTag.className = 'level-tag';
      levelTag.textContent = qual.levelTag;

      const desc = document.createElement('p');
      desc.textContent = qual.description;

      const statusDiv = document.createElement('div');
      statusDiv.className = 'status';
      statusDiv.innerHTML = `<i class="fas ${qual.icon}"></i> ${qual.status}`;

      card.appendChild(iconDiv);
      card.appendChild(title);
      card.appendChild(levelTag);
      card.appendChild(desc);
      card.appendChild(statusDiv);

      if (!qual.noProgress) {
        let progress = 0;
        if (qual.progressType === 'date') {
          progress = calculateProgress(qual.startDate, qual.endDate);
        } else if (qual.progressType === 'fixed') {
          progress = qual.progressFixed;
        }
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
          <div class="progress-label">
            <span>Progress</span>
            <span class="progress-percent">${progress}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%;"></div>
          </div>
        `;
        card.appendChild(progressContainer);
      }
      container.appendChild(card);
    });
  }

  if (document.getElementById('quals-container')) {
    renderQualifications('quals-container');
  }

  // Called by site-data.js when qualifications come from the admin panel (Firestore)
  window.setQualifications = function (list) {
    currentQuals = list.map(q => ({ ...q, noProgress: q.progressType === 'none' }));
    renderQualifications('quals-container');
  };

  // ========================
  // Contact form – send to Google Sheets
  // ========================
  // IMPORTANT: Replace this URL with your own Google Apps Script Web App URL.
  // The script should accept POST requests with form data and append a row to your sheet.
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwEj4O55pkWiipiv6DBJWYiFSkt8HbFJVNKv_NgY-Do5YRLinKj-palXY6Jyw2spor-wg/exec';
  
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        alert('Please fill in name, email, and message.');
        return;
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('message', message);

      try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          body: formData,
          mode: 'no-cors' // required for many Google Apps Script deployments
        });
        // With no-cors we cannot read response, so we assume success
        alert('Message sent successfully!');
        contactForm.reset();
      } catch (error) {
        console.error('Error sending message:', error);
        alert('There was an error sending your message. Please try again later.');
      }
    });
  }
  
 const menuBtn = document.getElementById("menu-btn");
 const navLinks = document.querySelector(".nav-links");

 menuBtn.onclick = function(){

    navLinks.classList.toggle("active");

    if(navLinks.classList.contains("active")){
        menuBtn.innerHTML="✖";
    }else{
        menuBtn.innerHTML="☰";
    }

 }
});

window.addEventListener("load",()=>{

    setTimeout(()=>{

        document
        .getElementById("preloader")
        .classList.add("fade-out");

    },1000);

});

/* ==========================
   Skills: fill bars when visible
========================== */
(function(){
    const skillsSection=document.getElementById("skills");
    if(!skillsSection) return;
    if(!("IntersectionObserver" in window)){
        skillsSection.classList.add("in-view");
        return;
    }
    const observer=new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                skillsSection.classList.add("in-view");
                observer.disconnect();
            }
        });
    },{threshold:0.25});
    observer.observe(skillsSection);
})();

/* ==========================
   Gallery lightbox
========================== */
(function(){
    const box=document.createElement("div");
    box.className="lightbox";
    const big=document.createElement("img");
    box.appendChild(big);
    document.body.appendChild(box);
    const close=()=>box.classList.remove("open");
    document.addEventListener("click",e=>{
        const img=e.target.closest(".gallery-item img");
        if(!img) return;
        big.src=img.currentSrc||img.src;
        big.alt=img.alt;
        box.classList.add("open");
    });
    box.addEventListener("click",close);
    document.addEventListener("keydown",e=>{ if(e.key==="Escape") close(); });
})();
