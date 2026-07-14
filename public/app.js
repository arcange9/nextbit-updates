const API_BASE = '/.netlify/functions';

async function applySettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) return;
    const data = await res.json();
    const s = data.settings || {};
    document.querySelectorAll('[data-site-logo]').forEach(el => {
      if (s.logoUrl) { el.src = s.logoUrl; el.style.display = ''; } else { el.style.display = 'none'; }
    });
    document.querySelectorAll('[data-site-name]').forEach(el => { el.textContent = s.companyName || 'NextBit Updates'; });
    document.querySelectorAll('[data-copyright-year]').forEach(el => { el.textContent = s.copyrightYear || new Date().getFullYear(); });
    if (s.socialLinks) {
      const { youtube, facebook, twitter, instagram } = s.socialLinks;
      if (youtube) document.querySelectorAll('[data-social-youtube]').forEach(el => { el.href = youtube; });
      if (facebook) document.querySelectorAll('[data-social-facebook]').forEach(el => { el.href = facebook; });
      if (twitter) document.querySelectorAll('[data-social-twitter]').forEach(el => { el.href = twitter; });
      if (instagram) document.querySelectorAll('[data-social-instagram]').forEach(el => { el.href = instagram; });
    }
  } catch(e) { console.warn('Settings load failed', e); }
}

function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });
}

function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3500); });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function categoryBadge(cat) {
  const cls = cat === 'AI Tools' ? 'cat-ai' : 'cat-tech';
  return `<span class="article-category ${cls}">${cat}</span>`;
}

function catEmoji(cat) { return cat === 'AI Tools' ? '\uD83E\uDD16' : '\u26A1'; }

function buildArticleCard(article, featured = false) {
  const date = formatDate(article.createdAt);
  const thumb = article.thumbnail
    ? `<img src="${article.thumbnail}" alt="${article.title}" loading="lazy">`
    : `<div class="article-thumb-placeholder">${catEmoji(article.category)}</div>`;
  return `
    <a href="article.html?slug=${article.slug}" class="article-card${featured ? ' featured' : ''}">
      <div class="article-thumb">
        ${categoryBadge(article.category)}
        ${thumb}
      </div>
      <div class="article-body">
        <div class="article-meta"><span>${date}</span><span class="dot">&middot;</span><span>${article.readTime || '3 min read'}</span></div>
        <h3 class="article-title">${article.title}</h3>
        <p class="article-excerpt">${article.excerpt || ''}</p>
        <div class="article-footer"><span class="article-read-more">Read More &rarr;</span></div>
      </div>
    </a>
  `;
}

function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type=email]').value.trim();
      const msg = form.querySelector('.newsletter-msg');
      const btn = form.querySelector('button[type=submit]');
      if (!email) return;
      btn.disabled = true; btn.textContent = 'Subscribing...';
      try {
        const res = await fetch(`${API_BASE}/subscribe`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          if(msg){ msg.textContent = "\uD83C\uDF89 You're subscribed! Welcome to NextBit Updates."; msg.className = 'newsletter-msg success'; }
          form.querySelector('input').value = '';
        } else {
          if(msg){ msg.textContent = data.error || 'Subscription failed. Try again.'; msg.className = 'newsletter-msg error'; }
        }
      } catch {
        if(msg){ msg.textContent = 'Network error. Please try again.'; msg.className = 'newsletter-msg error'; }
      }
      btn.disabled = false; btn.textContent = 'Subscribe';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applySettings();
  initMobileMenu();
  initActiveNav();
  initNewsletter();
});