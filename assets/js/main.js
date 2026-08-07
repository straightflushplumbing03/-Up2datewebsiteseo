// STRAIGHT FLUSH PLUMBING & LEAK DETECTION — shared interactions

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
        q.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  // Current year in footer
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  // Leak Symptom Quiz — tap a symptom, get an instant diagnosis + link
  const symptomData = {
    'high-bill': { label: 'High Water Bill', urgency: 'Moderate urgency', text: 'A sudden jump in your bill with no change in usage is one of the clearest early signs of a hidden leak.', href: 'academy/why-is-my-water-bill-so-high.html' },
    'wet-wall': { label: 'Wet or Stained Wall', urgency: 'Address soon', text: 'Moisture on a wall usually means a supply line leak nearby is already causing damage.', href: 'academy/sound-of-running-water-in-wall.html' },
    'ceiling-stain': { label: 'Ceiling Stain / Drip', urgency: 'Address soon', text: 'A ceiling stain almost always means water is traveling from a leak above — the source may be further away than it looks.', href: 'services/leak-detection.html' },
    'warm-spot': { label: 'Warm Spot on Floor', urgency: 'High urgency', text: 'A warm patch on your floor is a classic sign of a hot water slab leak underneath.', href: 'academy/warm-spot-on-floor-slab-leak.html' },
    'low-pressure': { label: 'Low Water Pressure', urgency: 'Moderate urgency', text: 'Dropping pressure can point to a leak in the line before it reaches your fixtures.', href: 'services/leak-detection.html' },
    'hear-water': { label: 'Hear Water Running', urgency: 'High urgency', text: 'The sound of running water with everything off is a strong, specific sign of an active leak.', href: 'academy/sound-of-running-water-in-wall.html' },
  };
  const symptomButtons = document.querySelectorAll('[data-symptom]');
  const symptomResult = document.getElementById('symptomResult');
  if (symptomButtons.length && symptomResult) {
    symptomButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-symptom');
        const d = symptomData[key];
        if (!d) return;
        symptomButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        symptomResult.innerHTML = `<strong>${d.label} — ${d.urgency}</strong><p>${d.text}</p><a href="${symptomResult.dataset.prefix || ''}${d.href}">Learn more &rarr;</a>`;
        symptomResult.classList.add('show');
      });
    });
  }

  // Problem picker — tap a problem, jump to the relevant page
  document.querySelectorAll('[data-problem-link]').forEach(card => {
    card.addEventListener('click', () => {
      const href = card.getAttribute('data-problem-link');
      if (href) window.location.href = href;
    });
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') card.click();
    });
  });
});
