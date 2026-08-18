// =========================================================
// UTILITIES
// =========================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =========================================================
// FOOTER YEAR
// =========================================================
document.getElementById('year').textContent = new Date().getFullYear();

// =========================================================
// MOBILE NAV TOGGLE
// =========================================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// =========================================================
// ACTIVE NAV LINK ON SCROLL
// =========================================================
const sections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

sections.forEach(section => navObserver.observe(section));

// =========================================================
// SCROLL REVEAL ANIMATIONS
// =========================================================
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));
}

// =========================================================
// SKILL BAR FILL ANIMATION (triggers once, on scroll into view)
// =========================================================
const skillBars = document.querySelectorAll('.skill-bar');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const fill = bar.querySelector('.skill-fill');
      const level = bar.getAttribute('data-level');
      fill.style.width = `${level}%`;
      skillObserver.unobserve(bar);
    }
  });
}, { threshold: 0.4 });

skillBars.forEach(bar => skillObserver.observe(bar));

// =========================================================
// ANIMATED STAT COUNTERS
// =========================================================
const statNums = document.querySelectorAll('.stat-num');

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = prefersReducedMotion ? 0 : 1200;
      const start = performance.now();

      function tick(now) {
        const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statNums.forEach(el => countObserver.observe(el));

// =========================================================
// CUSTOM BRUSH CURSOR (desktop only, decorative)
// =========================================================
const cursor = document.querySelector('.brush-cursor');
if (cursor && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.opacity = '1';
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%, -50%) scale(1.8)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%, -50%) scale(1)');
  });
}

// =========================================================
// CONTACT FORM VALIDATION
// =========================================================
const form = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

const fields = {
  name: {
    input: document.getElementById('name'),
    error: document.getElementById('nameError'),
    validate: (value) => {
      if (!value.trim()) return 'Please enter your name.';
      if (value.trim().length < 2) return 'Name looks too short.';
      return '';
    }
  },
  email: {
    input: document.getElementById('email'),
    error: document.getElementById('emailError'),
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) return 'Please enter your email.';
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    }
  },
  subject: {
    input: document.getElementById('subject'),
    error: document.getElementById('subjectError'),
    validate: (value) => {
      if (!value.trim()) return 'Please add a subject.';
      return '';
    }
  },
  message: {
    input: document.getElementById('message'),
    error: document.getElementById('messageError'),
    validate: (value) => {
      if (!value.trim()) return 'Please write a message.';
      if (value.trim().length < 10) return 'Message should be at least 10 characters.';
      return '';
    }
  }
};

function validateField(key) {
  const field = fields[key];
  const errorMsg = field.validate(field.input.value);
  const row = field.input.closest('.form-row');

  if (errorMsg) {
    row.classList.add('has-error');
    field.error.textContent = errorMsg;
    return false;
  } else {
    row.classList.remove('has-error');
    field.error.textContent = '';
    return true;
  }
}

// Live validation as the user types (after first blur)
Object.keys(fields).forEach(key => {
  const field = fields[key];
  field.input.addEventListener('blur', () => validateField(key));
  field.input.addEventListener('input', () => {
    if (field.input.closest('.form-row').classList.contains('has-error')) {
      validateField(key);
    }
  });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let isValid = true;
  Object.keys(fields).forEach(key => {
    if (!validateField(key)) isValid = false;
  });

  if (!isValid) {
    formStatus.textContent = 'Please fix the errors above before sending.';
    formStatus.className = 'form-status error';
    return;
  }

  // No backend is wired up yet — this simulates a successful send.
  // Replace this block with a fetch() call to your form endpoint
  // (e.g. Formspree, EmailJS, or your own API) when ready.
  formStatus.textContent = 'Sending…';
  formStatus.className = 'form-status';

  setTimeout(() => {
    formStatus.textContent = `Thanks, ${fields.name.input.value.trim()}! Your message has been sent.`;
    formStatus.className = 'form-status success';
    form.reset();
  }, 700);
});
