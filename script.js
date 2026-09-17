/**
 * AL FARUK TECHNOLOGIES – script.js
 * Modules : Lang | Navbar | Scroll | Reveal | Counter | Slider
 *           Catalog | Form | WAChat | BackToTop | FAQ | Misc
 */

'use strict';

/* ═══════════════════════════════════
   STORE – état global partagé
═══════════════════════════════════ */
const Store = {
  lang: localStorage.getItem('aft_lang') || 'fr',
  set(lang) {
    this.lang = lang;
    localStorage.setItem('aft_lang', lang);
  }
};


/* ═══════════════════════════════════
   MODULE 1 – MOTEUR MULTILINGUE
   Stratégie : data-fr / data-en sur chaque nœud texte feuille
═══════════════════════════════════ */
const LangModule = (() => {

  const translatePage = (lang) => {
    document.querySelectorAll('[data-fr]').forEach(el => {
      const txt = el.getAttribute('data-' + lang);
      if (txt === null || txt === undefined) return;
      if (el.children.length === 0) {
        el.innerHTML = txt;
      }
    });

    /* Placeholders formulaire */
    const ph = {
      fr: { name: 'M. Faruk Oumar', phone: '07 XX XX XX XX', email: 'votre@email.com',
            message: "Décrivez votre besoin (matériel, service, urgence...)" },
      en: { name: 'Mr. Faruk Oumar', phone: '07 XX XX XX XX', email: 'your@email.com',
            message: 'Describe your need (equipment, service, urgency...)' }
    }[lang] || {};
    const sp = (id, v) => { const e = document.getElementById(id); if (e && v) e.placeholder = v; };
    sp('name', ph.name); sp('phone', ph.phone); sp('email', ph.email); sp('message', ph.message);

    /* Select service options */
    const fOpt = document.querySelector('#subject option[disabled]');
    if (fOpt) fOpt.textContent = lang === 'en' ? 'Choose a subject...' : 'Choisissez un sujet...';
    document.querySelectorAll('#subject option:not([disabled])').forEach(o => {
      const v = o.getAttribute('data-' + lang); if (v) o.textContent = v;
    });

    /* SEO metas */
    const mT = document.getElementById('meta-title');
    const mD = document.getElementById('meta-desc');
    if (lang === 'en') {
      if (mT) mT.textContent = 'AL FARUK TECHNOLOGIES – IT Services & Tech Equipment in Abidjan | Côte d\'Ivoire';
      if (mD) mD.setAttribute('content', 'AL FARUK TECHNOLOGIES: IT maintenance, networks, web development and tech equipment in Abidjan. Free quote ☎ +225 07 49 94 50 33');
      document.getElementById('html-root')?.setAttribute('lang', 'en');
    } else {
      if (mT) mT.textContent = 'AL FARUK TECHNOLOGIES – Maintenance Informatique & Solutions Digitales à Abidjan';
      if (mD) mD.setAttribute('content', "AL FARUK TECHNOLOGIES : maintenance informatique, réseaux, création web et matériel technologique à Abidjan. Devis gratuit ☎ +225 07 49 94 50 33");
      document.getElementById('html-root')?.setAttribute('lang', 'fr');
    }

    /* Boutons langue */
    document.querySelectorAll('.lang-btn').forEach(btn => {
      const bLang = btn.getAttribute('data-lang');
      const isActive = bLang === lang;
      btn.classList.toggle('lang-btn--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
      btn.textContent = bLang === 'fr' ? 'Français' : 'English';
    });

    Store.set(lang);
  };

  const init = () => {
    translatePage(Store.lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const l = btn.getAttribute('data-lang');
        if (l !== Store.lang) translatePage(l);
      });
    });
  };

  return { init, translatePage };
})();


/* ═══════════════════════════════════
   MODULE 2 – NAVBAR
═══════════════════════════════════ */
const NavbarModule = (() => {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu?.querySelectorAll('.mobile__link, .btn, .mob-soc, .mobile__lang .lang-btn');

  const handleScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  const toggleMenu = (forceClose = false) => {
    if (!hamburger || !mobileMenu) return;
    const isOpen = !forceClose && !hamburger.classList.contains('open');
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const updateActiveLinks = () => {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav__link');
    const scrollY = window.scrollY + 140;
    sections.forEach(sec => {
      const top = sec.offsetTop, bot = top + sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < bot) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  };

  const init = () => {
    if (!navbar) return;
    hamburger?.addEventListener('click', () => toggleMenu());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(true); });
    mobileLinks?.forEach(l => {
      if (!l.classList.contains('lang-btn')) {
        l.addEventListener('click', () => toggleMenu(true));
      }
    });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', updateActiveLinks, { passive: true });
    handleScroll();
    updateActiveLinks();
  };

  return { init };
})();


/* ═══════════════════════════════════
   MODULE 3 – SMOOTH SCROLL
═══════════════════════════════════ */
const SmoothScrollModule = (() => {
  const init = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 4 – SCROLL REVEAL
═══════════════════════════════════ */
const RevealModule = (() => {
  const init = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => observer.observe(el));

    setTimeout(() => { els.forEach(el => el.classList.add('visible')); }, 2500);
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 5 – ANIMATED COUNTERS
═══════════════════════════════════ */
const CounterModule = (() => {
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const animate = (el, target, suffix, dur = 1600) => {
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(easeOut(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const init = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const target = parseInt(e.target.getAttribute('data-count'), 10);
          const suffix = e.target.getAttribute('data-suffix') || '';
          animate(e.target, target, suffix);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => observer.observe(c));
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 6 – TESTIMONIALS SLIDER
═══════════════════════════════════ */
const SliderModule = (() => {
  let idx = 0, timer, dragging = false, startX = 0;
  let track, cards, dots, btnP, btnN;

  const perView = () => window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  const maxIdx = () => Math.max(0, (cards?.length || 0) - perView());

  const goTo = i => {
    idx = Math.max(0, Math.min(i, maxIdx()));
    if (!track || !cards?.length) return;
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    track.style.transform = `translateX(-${idx * (cards[0].offsetWidth + gap)}px)`;
    dots?.forEach((d, j) => { d.classList.toggle('sdot--on', j === idx); d.setAttribute('aria-selected', String(j === idx)); });
  };

  const next = () => goTo(idx + 1 > maxIdx() ? 0 : idx + 1);
  const prev = () => goTo(idx - 1 < 0 ? maxIdx() : idx - 1);
  const startAuto = () => { timer = setInterval(next, 5500); };
  const stopAuto = () => clearInterval(timer);

  const onDown = e => { dragging = true; startX = e.touches?.[0].clientX ?? e.clientX; stopAuto(); };
  const onUp = e => {
    if (!dragging) return;
    dragging = false;
    const diff = startX - (e.changedTouches?.[0].clientX ?? e.clientX);
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAuto();
  };

  const init = () => {
    track = document.getElementById('testimonialsTrack');
    cards = track?.querySelectorAll('.tcard');
    dots = document.querySelectorAll('.sdot');
    btnP = document.getElementById('sliderPrev');
    btnN = document.getElementById('sliderNext');
    if (!track || !cards?.length) return;

    btnP?.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
    btnN?.addEventListener('click', () => { next(); stopAuto(); startAuto(); });
    dots?.forEach((d, i) => d.addEventListener('click', () => { goTo(i); stopAuto(); startAuto(); }));
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchend', onUp);
    track.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
    window.addEventListener('resize', () => goTo(0), { passive: true });
    goTo(0);
    startAuto();
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 7 – CATALOGUE (filtres)
═══════════════════════════════════ */
const CatalogModule = (() => {
  const init = () => {
    const tabs = document.querySelectorAll('.catalog__tab');
    const items = document.querySelectorAll('.pcard');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-tab');
        tabs.forEach(t => t.classList.remove('catalog__tab--active'));
        tab.classList.add('catalog__tab--active');
        items.forEach(item => {
          const match = filter === 'all' || item.getAttribute('data-category') === filter;
          if (match) {
            item.style.display = '';
            item.style.opacity = '0'; item.style.transform = 'translateY(12px)';
            requestAnimationFrame(() => {
              item.style.transition = 'opacity .4s ease, transform .4s ease';
              item.style.opacity = '1'; item.style.transform = 'translateY(0)';
            });
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 7bis – MODAL DÉTAIL PRODUIT
═══════════════════════════════════ */
const ProductModalModule = (() => {
  let dialog, imgEl, badgeEl, titleEl, priceEl, descEl, specsEl, waBtnEl, closeBtn;

  const populate = (card, detailEl) => {
    const lang = Store.lang;

    const imgSrc = card.querySelector('.pcard__img img')?.getAttribute('src') || '';
    const imgAlt = card.querySelector('.pcard__img img')?.getAttribute('alt') || '';
    const badge = card.querySelector('.pcard__badge');
    const title = card.querySelector('h3');
    const price = card.querySelector('.pcard__price');
    const waLink = card.querySelector('.pcard__wa-btn')?.getAttribute('href') || '#';
    const descP = detailEl.querySelector('p');
    const specsUl = detailEl.querySelector('.pcard__detail-specs');

    imgEl.src = imgSrc;
    imgEl.alt = imgAlt;

    if (badge) {
      badgeEl.textContent = badge.getAttribute(`data-${lang}`) || badge.textContent;
      badgeEl.classList.toggle('product-modal__badge--out', badge.classList.contains('pcard__badge--out'));
      badgeEl.style.display = '';
    } else {
      badgeEl.style.display = 'none';
    }

    titleEl.textContent = title?.getAttribute(`data-${lang}`) || title?.textContent || '';
    priceEl.textContent = price?.getAttribute(`data-${lang}`) || price?.textContent || '';
    descEl.textContent = descP?.getAttribute(`data-${lang}`) || descP?.textContent || '';

    specsEl.innerHTML = '';
    const listAttr = specsUl?.getAttribute(`data-${lang}-list`) || specsUl?.getAttribute('data-fr-list') || '';
    listAttr.split('|').filter(Boolean).forEach(spec => {
      const li = document.createElement('li');
      li.textContent = spec;
      specsEl.appendChild(li);
    });

    waBtnEl.setAttribute('href', waLink);
  };

  const openFromButton = (btn) => {
    const targetId = btn.getAttribute('data-modal-target');
    const detailEl = document.getElementById(targetId);
    const card = btn.closest('.pcard');
    if (!detailEl || !card || !dialog) return;
    populate(card, detailEl);
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  };

  const close = () => {
    if (dialog?.open) dialog.close();
  };

  const init = () => {
    dialog = document.getElementById('productModal');
    if (!dialog) return;
    imgEl = document.getElementById('productModalImg');
    badgeEl = document.getElementById('productModalBadge');
    titleEl = document.getElementById('productModalTitle');
    priceEl = document.getElementById('productModalPrice');
    descEl = document.getElementById('productModalDesc');
    specsEl = document.getElementById('productModalSpecs');
    waBtnEl = document.getElementById('productModalWaBtn');
    closeBtn = document.getElementById('productModalClose');

    document.querySelectorAll('.pcard__detail-btn').forEach(btn => {
      btn.addEventListener('click', () => openFromButton(btn));
    });

    closeBtn?.addEventListener('click', close);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close();
    });
  };

  return { init };
})();


/* ═══════════════════════════════════
   MODULE 8 – FORM VALIDATION (mailto)
═══════════════════════════════════ */
const FormModule = (() => {
  const rules = {
    name: { required: true, minLength: 2, msg: { fr: 'Nom complet requis (min. 2 caractères).', en: 'Full name required (min. 2 characters).' } },
    phone: { required: true, pattern: /^[0-9\s+\-.]{8,15}$/, msg: { fr: 'Numéro invalide (ex : 07 49 94 50 33).', en: 'Invalid number (e.g. 07 49 94 50 33).' } },
    email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: { fr: 'Adresse email invalide.', en: 'Invalid email address.' } },
    subject: { required: true, msg: { fr: 'Veuillez sélectionner un sujet.', en: 'Please select a subject.' } },
    message: { required: true, minLength: 5, msg: { fr: 'Merci de décrire votre besoin.', en: 'Please describe your need.' } },
  };

  const setError = (id, msgObj) => {
    document.getElementById(id)?.classList.add('error');
    const el = document.getElementById(`${id}Error`);
    if (el) el.textContent = msgObj[Store.lang] || msgObj.fr;
  };
  const clearError = id => {
    document.getElementById(id)?.classList.remove('error');
    const el = document.getElementById(`${id}Error`);
    if (el) el.textContent = '';
  };
  const validate = (id, value) => {
    const r = rules[id];
    if (!r) return true;
    if (r.required && !value.trim()) { setError(id, r.msg); return false; }
    if (!r.required && !value.trim()) { clearError(id); return true; }
    if (r.minLength && value.trim().length < r.minLength) { setError(id, r.msg); return false; }
    if (r.pattern && !r.pattern.test(value.trim())) { setError(id, r.msg); return false; }
    clearError(id); return true;
  };

  const sendMail = () => {
    const name = document.getElementById('name')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const subjectSelect = document.getElementById('subject');
    const subjectLabel = subjectSelect?.options[subjectSelect.selectedIndex]?.text || '';
    const message = document.getElementById('message')?.value || '';

    const subject = `Demande de contact - ${subjectLabel || name}`;
    const bodyLines = [
      `Nom : ${name}`,
      `Téléphone : ${phone}`,
      email ? `Email : ${email}` : null,
      `Sujet : ${subjectLabel}`,
      '',
      message,
    ].filter(Boolean);
    const url = `mailto:alfaruktechnologies@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = url;
  };

  const submitFeedback = (btn) => {
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      btn.classList.remove('loading');
      btn.disabled = false;

      const textEl = btn.querySelector('.btn__text');
      const original = textEl ? textEl.textContent : '';
      if (textEl) {
        textEl.textContent = Store.lang === 'en' ? '✓ Mail client opened' : '✓ Client mail ouvert';
      }

      setTimeout(() => {
        if (textEl) textEl.textContent = original;
      }, 3500);
    }, 500);
  };

  const init = () => {
    const form = document.getElementById('contactForm');
    const btn = document.getElementById('submitBtn');
    if (!form) return;
    Object.keys(rules).forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener('blur', () => validate(id, el.value));
      el?.addEventListener('input', () => { if (el.classList.contains('error')) validate(id, el.value); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = Object.keys(rules).map(id => {
        const el = document.getElementById(id);
        return el ? validate(id, el.value) : true;
      }).every(Boolean);
      if (!ok) { form.querySelector('.error')?.focus(); return; }
      sendMail();
      submitFeedback(btn);
    });
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 9 – WHATSAPP CHAT AUTOMATISÉ
═══════════════════════════════════ */
const WAChatModule = (() => {
  const init = () => {
    const chat = document.getElementById('waChat');
    const fab = document.getElementById('waFab');
    const closeBtn = document.getElementById('waBubbleClose');
    const badge = document.getElementById('waBadge');
    if (!chat || !fab) return;

    let opened = false;

    const openChat = () => {
      chat.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      if (badge) badge.style.display = 'none';
      opened = true;
    };
    const closeChat = () => {
      chat.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    };

    fab.addEventListener('click', () => {
      chat.classList.contains('open') ? closeChat() : openChat();
    });
    closeBtn?.addEventListener('click', closeChat);

    setTimeout(() => {
      if (!opened && !sessionStorage.getItem('aft_chat_dismissed')) {
        openChat();
      }
    }, 9000);

    document.addEventListener('click', e => {
      if (!chat.contains(e.target) && !fab.contains(e.target)) {
        if (chat.classList.contains('open')) {
          closeChat();
          sessionStorage.setItem('aft_chat_dismissed', '1');
        }
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && chat.classList.contains('open')) closeChat();
    });
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 10 – BACK TO TOP
═══════════════════════════════════ */
const BackToTopModule = (() => {
  const init = () => {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 11 – FAQ ACCORDION
═══════════════════════════════════ */
const FAQModule = (() => {
  const init = () => {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) {
          items.forEach(other => { if (other !== item && other.open) other.removeAttribute('open'); });
        }
      });
    });
  };
  return { init };
})();


/* ═══════════════════════════════════
   MODULE 12 – MISC (année, lazy, parallax)
═══════════════════════════════════ */
const MiscModule = (() => {
  const initParallax = () => {
    const glows = document.querySelectorAll('.hero__glow');
    if (!glows.length || window.matchMedia('(max-width:768px)').matches) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        glows.forEach((c, i) => { c.style.transform = `translateY(${y * (.05 + i * .03)}px)`; });
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  };

  const init = () => {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    document.querySelectorAll('img:not([loading])').forEach(img => img.setAttribute('loading', 'lazy'));
    initParallax();

    console.log(
      '%c✓ AL FARUK TECHNOLOGIES | SEO | Multilingue FR/EN | Chat WhatsApp | FAQ',
      'color:#DC8233;font-weight:bold;font-size:12px;background:#05203D;padding:5px 10px;border-radius:6px;'
    );
  };
  return { init };
})();


/* ═══════════════════════════════════
   INIT – Bootstrap résilient
═══════════════════════════════════ */
const App = {
  init() {
    const modules = [
      ['LangModule', LangModule],
      ['NavbarModule', NavbarModule],
      ['SmoothScrollModule', SmoothScrollModule],
      ['RevealModule', RevealModule],
      ['CounterModule', CounterModule],
      ['SliderModule', SliderModule],
      ['CatalogModule', CatalogModule],
      ['ProductModalModule', ProductModalModule],
      ['FormModule', FormModule],
      ['WAChatModule', WAChatModule],
      ['BackToTopModule', BackToTopModule],
      ['FAQModule', FAQModule],
      ['MiscModule', MiscModule],
    ];

    modules.forEach(([name, mod]) => {
      try {
        mod.init();
      } catch (err) {
        console.error(`[AL FARUK TECHNOLOGIES] Erreur dans ${name}:`, err);
      }
    });
  }
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', () => App.init())
  : App.init();
