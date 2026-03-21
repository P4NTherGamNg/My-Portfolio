// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Dark mode
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

// Progress for NVQ Level 05
function getLevel5Progress() {
  const start = new Date('2026-01-09');
  const now = new Date();
  const elapsed = now - start;
  const total = 365 * 24 * 60 * 60 * 1000;
  let percent = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, percent));
}

function setupProgressAnimation() {
  const section = document.getElementById('qualifications');
  if (!section) return;
  const level4Target = 100;
  const level5Target = getLevel5Progress();
  const level4Container = document.getElementById('level4-progress');
  const level5Container = document.getElementById('level5-progress');
  if (level4Container) level4Container.querySelector('.progress-percent').textContent = level4Target + '%';
  if (level5Container) level5Container.querySelector('.progress-percent').textContent = Math.round(level5Target) + '%';
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (level4Container) level4Container.querySelector('.progress-fill').style.width = level4Target + '%';
        if (level5Container) level5Container.querySelector('.progress-fill').style.width = level5Target + '%';
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });
  observer.observe(section);
}
setupProgressAnimation();

// Optional: update navbar link if logged in
const loginLink = document.getElementById('login-link');
if (loginLink && localStorage.getItem('portfolio_logged_in') === 'true') {
  loginLink.textContent = 'Dashboard';
  loginLink.href = 'dashboard.html';
}