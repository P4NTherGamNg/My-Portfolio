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
  // Dark mode toggle
  // ========================
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle?.querySelector('i');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon?.classList.remove('fa-moon');
    themeIcon?.classList.add('fa-sun');
  }
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      themeIcon?.classList.remove('fa-moon');
      themeIcon?.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      themeIcon?.classList.remove('fa-sun');
      themeIcon?.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
    }
  });

  // ========================
  // Qualifications (read-only, stored in localStorage)
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

  function loadQualifications() {
    const stored = localStorage.getItem('qualifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      // If the stored data contains the newer level15/14 IDs, replace with original default
      const hasNewIds = parsed.some(item => item.id === 'level15' || item.id === 'level14');
      if (hasNewIds) {
        localStorage.setItem('qualifications', JSON.stringify(defaultQualifications));
        return defaultQualifications;
      }
      
      // Check if English certificate is missing (for users with existing data)
      const hasEnglish = parsed.some(item => item.id === 'english-cert');
      if (!hasEnglish) {
        // Add English cert to existing data
        const updated = [...parsed, defaultQualifications.find(q => q.id === 'english-cert')];
        localStorage.setItem('qualifications', JSON.stringify(updated));
        return updated;
      }
      return parsed;
    } else {
      localStorage.setItem('qualifications', JSON.stringify(defaultQualifications));
      return defaultQualifications;
    }
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
    let quals = loadQualifications();
    // Sort by updatedAt / createdAt descending (original behavior)
    quals.sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt || 0;
      const bTime = b.updatedAt || b.createdAt || 0;
      return bTime - aTime;
    });
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

  // ========================
  // Contact form – send to Google Sheets
  // ========================
  // IMPORTANT: Replace this URL with your own Google Apps Script Web App URL.
  // The script should accept POST requests with form data and append a row to your sheet.
  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyse_KxpeDr9mfzGOMfMD4Pp0F25a-sUkAtDR_htqP0lMJVfbqD1xYvQcEPl9UviCTgMA/exec';

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
});