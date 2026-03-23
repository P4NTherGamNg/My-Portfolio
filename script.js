 // ---------- DARK MODE ----------
    const toggleBtn = document.getElementById('darkModeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      document.body.classList.add('dark');
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light';
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i> Dark';
    }
    toggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light' : '<i class="fas fa-moon"></i> Dark';
    });

    // Age calc
    function calculateAge(birthDate) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    }
    const birth = new Date(2004, 8, 28); // sep 28
    const age = calculateAge(birth);
    const ageSpan = document.getElementById('ageDisplay');
    if (ageSpan) ageSpan.innerHTML = `(Age: ${age})`;

    // ---------- GOOGLE SHEETS INTEGRATION (Replace with YOUR Apps Script URL) ----------
    // IMPORTANT: After setting up Google Apps Script, replace this URL.
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSKOnotORDejZd_Bkt-KJ143VHuSUYcGyNzlVp6QWkQgaaAt73NvCrEgHEMeSWCTGOLg/exec";  // <---- PASTE YOUR WEB APP URL HERE

    const contactForm = document.getElementById('contactForm');
    const feedbackDiv = document.getElementById('formFeedback');
    const sendBtn = document.getElementById('sendBtn');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        feedbackDiv.innerHTML = '<span style="color:#ef4444;">❌ Please fill required fields (Name, Email, Message).</span>';
        return;
      }
      if (!SCRIPT_URL || SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL") {
        feedbackDiv.innerHTML = '<span style="color:#ef4444;">⚠️ Google Script URL not configured. Please follow setup guide.</span>';
        return;
      }

      const payload = { name, email, number: phone, message };
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...';
      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.result === 'success') {
          feedbackDiv.innerHTML = '<span style="color:#10b981;">✅ Message sent successfully! I’ll reply soon.</span>';
          contactForm.reset();
        } else {
          feedbackDiv.innerHTML = '<span style="color:#ef4444;">❌ Error sending message. Try again later.</span>';
        }
      } catch (err) {
        console.error(err);
        feedbackDiv.innerHTML = '<span style="color:#ef4444;">❌ Network error. Check console.</span>';
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        setTimeout(() => {
          if (feedbackDiv.innerHTML.includes('success')) feedbackDiv.innerHTML = '';
        }, 5000);
      }
    });

  <!-- Instruction note for user: Replace SCRIPT_URL after Apps Script deployment -->
