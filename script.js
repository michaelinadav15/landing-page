/* ===== STICKY HEADER ===== */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ===== SCROLL ANIMATIONS ===== */
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('in-view'), delay);
    animObserver.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animate-on-scroll').forEach(el => animObserver.observe(el));

/* ===== SMOOTH SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 68;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===== FAQ ACCORDION ===== */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('faq-item--open');
    // Close all open items
    document.querySelectorAll('.faq-item--open').forEach(openItem => {
      openItem.classList.remove('faq-item--open');
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    // Open clicked item if it was closed
    if (!isOpen) {
      item.classList.add('faq-item--open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ===== CONTACT FORM ===== */
const FORMSPREE_URL = 'https://formspree.io/f/xaqvogor';

const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

function validateField(input) {
  const empty = !input.value.trim();
  if (input.required && empty) {
    input.classList.add('error');
    return false;
  }
  if (input.type === 'tel' && !empty) {
    const digits = input.value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 12) {
      input.classList.add('error');
      return false;
    }
  }
  input.classList.remove('error');
  return true;
}

if (form) {
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameField = document.getElementById('field-name');
    const phoneField = document.getElementById('field-phone');
    const valid = [nameField, phoneField].map(validateField).every(Boolean);
    if (!valid) return;

    const now = new Date();
    const payload = {
      name: nameField.value.trim(),
      phone: phoneField.value.trim(),
      segment: document.getElementById('field-segment').value,
      date: now.toLocaleDateString('he-IL'),
      time: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'שולח...';

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showSuccess(payload.name);
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'משהו השתבש — נסה שוב';
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'משהו השתבש — נסה שוב';
    }
  });
}

function showSuccess(name) {
  const firstName = name.split(' ')[0];
  const container = form.parentElement;
  form.style.display = 'none';

  const msg = document.createElement('div');
  msg.className = 'form-success';
  msg.innerHTML = `
    תודה, ${firstName}! קיבלתי את הפרטים שלך.<br/>
    <span style="font-size:0.9rem;font-weight:400;opacity:0.85">אחזור אליך תוך יום עסקים — כדי לתאם שיחת היכרות קצרה.</span>
  `;
  container.appendChild(msg);
}

/* ===== HERO FORM ===== */
const heroForm = document.getElementById('hero-form');
const heroSubmitBtn = document.getElementById('hero-submit-btn');
const heroSuccess = document.getElementById('hero-form-success');

if (heroForm) {
  heroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('hero-field-name');
    const phoneEl = document.getElementById('hero-field-phone');

    nameEl.classList.remove('error');
    phoneEl.classList.remove('error');

    let valid = true;
    if (!nameEl.value.trim()) { nameEl.classList.add('error'); valid = false; }
    const digits = phoneEl.value.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 12) { phoneEl.classList.add('error'); valid = false; }
    if (!valid) return;

    heroSubmitBtn.disabled = true;
    heroSubmitBtn.textContent = 'שולח...';

    const now = new Date();
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: nameEl.value.trim(),
          phone: phoneEl.value.trim(),
          segment: 'מטופס הירו',
          date: now.toLocaleDateString('he-IL'),
          time: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
        }),
      });
      if (res.ok) {
        heroForm.style.display = 'none';
        heroSuccess.style.display = 'block';
      } else {
        heroSubmitBtn.disabled = false;
        heroSubmitBtn.textContent = 'משהו השתבש — נסה שוב';
      }
    } catch {
      heroSubmitBtn.disabled = false;
      heroSubmitBtn.textContent = 'משהו השתבש — נסה שוב';
    }
  });
}

/* ===== WHATSAPP CTA — add phone easily ===== */
// Replace 972XXXXXXXXX in index.html with your number (e.g. 972501234567)
