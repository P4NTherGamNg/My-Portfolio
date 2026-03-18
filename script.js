// Smooth scroll for internal anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('i');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeIcon.classList.remove('fa-moon');
  themeIcon.classList.add('fa-sun');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
    localStorage.setItem('theme', 'light');
  }
});

// Calculate progress for NVQ Level 05 based on start date
function getLevel5Progress() {
  const startDate = new Date('2026-01-09'); // Jan 9, 2026
  const now = new Date();
  const totalDays = 365; // assume 12 months
  const elapsedMs = now - startDate;
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
  let percent = (elapsedDays / totalDays) * 100;
  percent = Math.min(100, Math.max(0, percent)); // clamp
  return percent;
}

// Animate progress bars when qualifications section becomes visible
function setupProgressAnimation() {
  const qualificationsSection = document.getElementById('qualifications');
  if (!qualificationsSection) return;

  // Target percentages
  const level4Target = 100;
  const level5Target = getLevel5Progress();

  // Update percentage text and store target widths
  const level4Container = document.getElementById('level4-progress');
  const level5Container = document.getElementById('level5-progress');

  if (level4Container) {
    const percentSpan = level4Container.querySelector('.progress-percent');
    percentSpan.textContent = level4Target + '%';
  }
  if (level5Container) {
    const percentSpan = level5Container.querySelector('.progress-percent');
    percentSpan.textContent = Math.round(level5Target) + '%';
  }

  // Intersection Observer to trigger animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate level 4 bar
        if (level4Container) {
          const fill = level4Container.querySelector('.progress-fill');
          fill.style.width = level4Target + '%';
        }
        // Animate level 5 bar
        if (level5Container) {
          const fill = level5Container.querySelector('.progress-fill');
          fill.style.width = level5Target + '%';
        }
        // Stop observing after first trigger
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 }); // trigger when 30% visible

  observer.observe(qualificationsSection);
}


// Contact form submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;

    // Here you would normally send data to a server
    console.log('Form submitted:', { name, email, phone, message });
    
    // Optional: show a success message
    alert('Thank you for your message!');
    
    // Clear form
    contactForm.reset();
  });
}

// Optional: Update navbar link if logged in
const loginLink = document.getElementById('login-link');
if (loginLink && localStorage.getItem('portfolio_logged_in') === 'true') {
  loginLink.textContent = 'Dashboard';
  loginLink.href = 'dashboard.html';
}

// Initialize animation on page load
setupProgressAnimation();