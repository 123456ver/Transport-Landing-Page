let siteData = {};

async function loadContent() {
  try {
    const res = await fetch('/api/content');
    siteData = await res.json();
    console.log('Content loaded:', siteData);
    applyContent();
  } catch (e) {
    console.error('Failed to load content:', e);
  }
}

function applyContent() {
  if (!siteData.company) {
    console.log('No company data found');
    return;
  }
  
  // Hero - using IDs (bulletproof)
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSubtitle');
  
  if (heroTitle) {
    heroTitle.textContent = siteData.hero.title;
    console.log('Hero title updated to:', siteData.hero.title);
  } else {
    console.log('heroTitle element NOT FOUND');
  }
  
  if (heroSub) {
    heroSub.textContent = siteData.hero.subtitle;
  }
  
  // Logo
  document.querySelectorAll('.logo').forEach(el => {
    el.innerHTML = '<i class="fas fa-truck-moving"></i> ' + siteData.company.name + '<span>' + siteData.company.suffix + '</span>';
  });
  
  // Contact info
  document.querySelectorAll('.c-item.whatsapp strong').forEach(el => el.textContent = siteData.company.phone);
  document.querySelectorAll('.c-item.email strong').forEach(el => el.textContent = siteData.company.email);
  
  // WhatsApp links
  const phoneClean = siteData.company.phone.replace(/\D/g, '');
  document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
    a.href = 'https://wa.me/' + phoneClean + '?text=Hello%20' + encodeURIComponent(siteData.company.name + ' ' + siteData.company.suffix);
  });
  
  // Services
  const cards = document.querySelectorAll('.service-card');
  siteData.services.forEach((svc, i) => {
    if (cards[i]) {
      const h3 = cards[i].querySelector('h3');
      const p = cards[i].querySelector('p');
      if (h3) h3.textContent = svc.title;
      if (p) p.textContent = svc.description;
    }
  });
  
  // Footer
  const footerP = document.querySelector('footer .footer-grid > div:first-child p');
  if (footerP) footerP.textContent = siteData.footer.tagline;
}

// Navbar
const navbar = document.getElementById('navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 50));
mobileToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const i = mobileToggle.querySelector('i');
  i.classList.toggle('fa-bars');
  i.classList.toggle('fa-times');
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('active');
  mobileToggle.querySelector('i').classList.add('fa-bars');
  mobileToggle.querySelector('i').classList.remove('fa-times');
}));

// Tabs
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  if (event && event.target) event.target.classList.add('active');
}

function selectService(s) {
  document.querySelector('select[name="service"]').value = s;
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

// Contact form
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target, btn = form.querySelector('.btn-submit'), status = document.getElementById('status');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;
  status.className = 'status';
  status.style.display = 'none';
  
  try {
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
      status.textContent = result.message;
      status.className = 'status success';
      form.reset();
      if (data.contactMethod === 'whatsapp' && siteData.company) {
        const phone = siteData.company.phone.replace(/\D/g, '');
        const msg = 'Hello ' + siteData.company.name + ' ' + siteData.company.suffix + ', I am ' + data.name + ' from ' + data.location + '. I need ' + data.service + '. Details: ' + data.message;
        window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
      }
    } else {
      throw new Error(result.error || 'Failed');
    }
  } catch (err) {
    status.textContent = err.message;
    status.className = 'status error';
  } finally {
    btn.innerHTML = orig;
    btn.disabled = false;
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', function(e) {
  e.preventDefault();
  const t = document.querySelector(this.getAttribute('href'));
  if (t) t.scrollIntoView({ behavior: 'smooth' });
}));

// Animations
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: .1 });
document.querySelectorAll('.service-card, .region').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .6s, transform .6s';
  obs.observe(el);
});

// Load content when page loads
loadContent();
