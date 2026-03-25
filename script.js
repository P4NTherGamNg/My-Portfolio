// script.js - Portfolio Interactions & Google Sheets Integration

// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const icon = themeToggle.querySelector('i');
  if (body.classList.contains('light-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});

// Mobile Menu
const menuIcon = document.querySelector('.mobile-menu-icon');
const navLinks = document.querySelector('.nav-links');
menuIcon.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
// Close menu when a link is clicked
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// ---------- Qualifications Data (dynamic cards with progress bars) ----------
const qualificationsData = [
  {
    title: "ICT NVQ Level 04",
    institution: "Ruwanwella VTA",
    start: "2023-01-10",
    end: "2024-12-20",
    description: "Completed with distinction in ICT practicals."
  },
  {
    title: "ICT NVQ Level 05",
    institution: "Ruwanwella VTA (18 month diploma)",
    start: "2026-01-09",
    end: "2027-07-09",
    description: "Ongoing advanced diploma in ICT & software development."
  },
  {
    title: "Web Development Bootcamp",
    institution: "Online Certification",
    start: "2025-02-01",
    end: "2025-08-01",
    description: "Full-stack MERN stack intensive course."
  },
  {
    title: "Python for Data Science",
    institution: "Coursera",
    start: "2024-06-01",
    end: "2024-09-30",
    description: "Data analysis & automation."
  }
];

// Helper: compute progress percentage based on start & end dates
function getProgressPercentage(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const now = new Date();
  if (now < start) return 0;
  if (now > end) return 100;
  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function buildQualificationCards() {
  const track = document.getElementById('qualificationsTrack');
  if (!track) return;
  track.innerHTML = '';
  qualificationsData.forEach(q => {
    const progress = getProgressPercentage(q.start, q.end);
    const card = document.createElement('div');
    card.className = 'qual-card';
    card.innerHTML = `
      <h3>${q.title}</h3>
      <p class="institution">${q.institution}</p>
      <div class="date-range"><i class="far fa-calendar-alt"></i> ${formatDate(q.start)} — ${formatDate(q.end)}</div>
      <div class="progress-bar-container">
        <div class="progress-fill" style="width: ${progress}%;"></div>
      </div>
      <p class="description">${q.description}</p>
      <small>${Math.round(progress)}% completed</small>
    `;
    track.appendChild(card);
  });
}
buildQualificationCards();

// Horizontal Scroll Buttons
const leftBtn = document.getElementById('scrollLeftBtn');
const rightBtn = document.getElementById('scrollRightBtn');
const trackDiv = document.getElementById('qualificationsTrack');
if (leftBtn && rightBtn && trackDiv) {
  leftBtn.addEventListener('click', () => {
    trackDiv.scrollBy({ left: -300, behavior: 'smooth' });
  });
  rightBtn.addEventListener('click', () => {
    trackDiv.scrollBy({ left: 300, behavior: 'smooth' });
  });
}

// ---------- Google Sheets Integration for Contact Form ----------
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const scriptURL = window.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwKyVS3gs2mICZc3ySR1ZPmoUiOg60s3WIEGhi6NVpj-dR2kc_vCaOn1qHOAL2Xes8ICQ/exec';

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('formName').value.trim();
  const email = document.getElementById('formEmail').value.trim();
  const phone = document.getElementById('formPhone').value.trim();
  const message = document.getElementById('formMessage').value.trim();

  if (!name || !email || !phone || !message) {
    formStatus.innerHTML = '<span style="color: #ff5555;">All fields are required!</span>';
    return;
  }

  formStatus.innerHTML = '<span>Sending...</span>';
  const formData = new FormData();
  formData.append('Name', name);
  formData.append('Email', email);
  formData.append('Phone', phone);
  formData.append('Message', message);
  formData.append('Timestamp', new Date().toISOString());

  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData
    });
    const result = await response.text();
    if (response.ok) {
      formStatus.innerHTML = '<span style="color: #0f0;">✅ Message sent successfully!</span>';
      contactForm.reset();
    } else {
      throw new Error(result);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    formStatus.innerHTML = '<span style="color: #ff5555;">❌ Failed to send. Please check the Google Script URL or try again later.</span>';
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});