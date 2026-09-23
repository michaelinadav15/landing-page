/* ==========================================================================
   השקעות בלי חליפות - נדב מיכאלי | JavaScript Logic
   ========================================================================== */

const FORMSPREE_URL = 'https://formspree.io/f/xaqvogor';

document.addEventListener('DOMContentLoaded', () => {

  /* ===== 1. FAQ ACCORDION TOGGLE ===== */
  const faqBtns = document.querySelectorAll('.faq-dark-btn');
  faqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.faq-dark-box');
      box.classList.toggle('active');
    });
  });

  /* ===== 2. LEAD FORM SUBMISSIONS (shared by all 3 forms: name + phone + age) ===== */
  function setupLeadForm({ formId, nameId, phoneId, ageId, btnId, msgId, location, onSuccess }) {
    const form = document.getElementById(formId);
    const btn = document.getElementById(btnId);
    const msg = document.getElementById(msgId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameEl = document.getElementById(nameId);
      const phoneEl = document.getElementById(phoneId);
      const ageEl = document.getElementById(ageId);

      let valid = true;
      if (!nameEl.value.trim()) {
        nameEl.style.outline = '2px solid var(--red-marker)';
        valid = false;
      } else {
        nameEl.style.outline = 'none';
      }

      const digits = phoneEl.value.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 12) {
        phoneEl.style.outline = '2px solid var(--red-marker)';
        valid = false;
      } else {
        phoneEl.style.outline = 'none';
      }

      const age = parseInt(ageEl.value, 10);
      if (!age || age < 14 || age > 99) {
        ageEl.style.outline = '2px solid var(--red-marker)';
        valid = false;
      } else {
        ageEl.style.outline = 'none';
      }

      if (!valid) return;

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'שולח...';
      }

      const now = new Date();
      // A shared ID stamped on BOTH this lead submission and the onboarding
      // quiz submission that follows it, so the two separate Formspree
      // entries for the same person can be matched up by searching this ID.
      const leadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      try {
        const res = await fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            'מזהה ליד': leadId,
            'שם מלא': nameEl.value.trim(),
            'טלפון': phoneEl.value.trim(),
            'גיל': age,
            'מקור הפנייה': location,
            'תאריך': now.toLocaleDateString('he-IL'),
            'שעה': now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          }),
        });

        if (res.ok) {
          form.style.display = 'none';
          if (msg) msg.style.display = 'block';
          if (typeof onSuccess === 'function') onSuccess({ name: nameEl.value.trim(), phone: phoneEl.value.trim(), age, leadId, location });
        } else {
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'משהו השתבש — נסה שוב';
          }
        }
      } catch (err) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'משהו השתבש — נסה שוב';
        }
      }
    });
  }

  setupLeadForm({
    formId: 'Lead-Form-2', nameId: 'Name-2', phoneId: 'Phone-2', ageId: 'Age-2',
    btnId: 'submit-btn-2', msgId: 'success-msg-2', location: 'טופס אמצע העמוד',
    onSuccess: openOnboardingQuiz,
  });

  setupLeadForm({
    formId: 'Lead-Form-Cta', nameId: 'Name-Cta', phoneId: 'Phone-Cta', ageId: 'Age-Cta',
    btnId: 'submit-btn-cta', msgId: 'success-msg-cta', location: 'טופס תחתית העמוד',
    onSuccess: openOnboardingQuiz,
  });

  setupLeadForm({
    formId: 'Lead-Form-Modal', nameId: 'Name-Modal', phoneId: 'Phone-Modal', ageId: 'Age-Modal',
    btnId: 'submit-btn-modal', msgId: 'success-msg-modal', location: 'פופאפ מכפתור ראשי',
    onSuccess: openOnboardingQuiz,
  });

  /* ===== LEAD MODAL — hero CTA opens a popup instead of scrolling to the bottom ===== */
  const leadModalOverlay = document.getElementById('lead-modal-overlay');
  const leadModalClose = document.getElementById('lead-modal-close');
  const heroCtaOpenModal = document.getElementById('hero-cta-open-modal');

  if (leadModalOverlay && heroCtaOpenModal) {
    heroCtaOpenModal.addEventListener('click', (e) => {
      e.preventDefault();
      leadModalOverlay.classList.add('active');
    });

    function closeLeadModal() {
      leadModalOverlay.classList.remove('active');
    }

    if (leadModalClose) leadModalClose.addEventListener('click', closeLeadModal);

    leadModalOverlay.addEventListener('click', (e) => {
      if (e.target === leadModalOverlay) closeLeadModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && leadModalOverlay.classList.contains('active')) closeLeadModal();
    });
  }

  /* ===== ONBOARDING QUIZ — opens right after any lead form submits successfully ===== */
  const quizOverlay = document.getElementById('quiz-overlay');
  const quizClose = document.getElementById('quiz-close');
  const quizForm = document.getElementById('onboarding-quiz-form');
  const quizThankYou = document.getElementById('quiz-thankyou');
  const quizScale = document.getElementById('quiz-scale');
  const quizImportanceInput = document.getElementById('q9-importance');
  const q2OtherRadio = document.getElementById('q2-other-radio');
  const q2OtherWrap = document.getElementById('q2-other-wrap');
  const q2OtherText = document.getElementById('q2-other-text');

  let currentLead = null;

  function closeQuiz() {
    if (quizOverlay) quizOverlay.classList.remove('active');
  }

  function openOnboardingQuiz(lead) {
    if (!quizOverlay) return;
    currentLead = lead || null;

    // Reset to a clean state in case the quiz was already filled/submitted
    // once before (e.g. the person somehow triggers a second lead form).
    if (quizForm) {
      quizForm.reset();
      quizForm.hidden = false;
      quizForm.querySelectorAll('.quiz-pill.is-selected').forEach(pill => pill.classList.remove('is-selected'));
      if (quizScale) quizScale.querySelectorAll('.quiz-scale-btn.is-selected').forEach(b => b.classList.remove('is-selected'));
      if (quizImportanceInput) quizImportanceInput.value = '';
      if (q2OtherWrap) q2OtherWrap.hidden = true;
      const submitBtn = document.getElementById('quiz-submit-btn');
      if (submitBtn) submitBtn.disabled = false;
    }
    if (quizThankYou) quizThankYou.hidden = true;

    // If the popup lead form is what was just submitted, close it first so
    // the two overlays don't stack on top of each other.
    const leadModalOverlayEl = document.getElementById('lead-modal-overlay');
    if (leadModalOverlayEl) leadModalOverlayEl.classList.remove('active');
    quizOverlay.classList.add('active');
  }

  if (quizOverlay) {
    if (quizClose) quizClose.addEventListener('click', closeQuiz);

    quizOverlay.addEventListener('click', (e) => {
      if (e.target === quizOverlay) closeQuiz();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && quizOverlay.classList.contains('active')) closeQuiz();
    });

    // Pill selection styling — radios clear their siblings, checkboxes just toggle
    document.querySelectorAll('.quiz-pill input').forEach(input => {
      input.addEventListener('change', () => {
        if (input.type === 'radio') {
          document.querySelectorAll(`input[name="${input.name}"]`).forEach(sibling => {
            sibling.closest('.quiz-pill').classList.toggle('is-selected', sibling.checked);
          });
        } else {
          input.closest('.quiz-pill').classList.toggle('is-selected', input.checked);
        }
      });
    });

    // "אחר" reveals a free-text field for Q2
    if (q2OtherRadio && q2OtherWrap) {
      document.querySelectorAll('input[name="q2_status"]').forEach(input => {
        input.addEventListener('change', () => {
          q2OtherWrap.hidden = !q2OtherRadio.checked;
        });
      });
    }

    // 1-5 importance scale
    if (quizScale) {
      quizScale.querySelectorAll('.quiz-scale-btn').forEach(scaleBtn => {
        scaleBtn.addEventListener('click', () => {
          quizScale.querySelectorAll('.quiz-scale-btn').forEach(b => b.classList.remove('is-selected'));
          scaleBtn.classList.add('is-selected');
          if (quizImportanceInput) quizImportanceInput.value = scaleBtn.dataset.value;
        });
      });
    }

    if (quizForm) {
      quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!quizImportanceInput.value) {
          quizScale.style.outline = '2px solid var(--red-marker)';
          quizScale.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        quizScale.style.outline = 'none';

        const formData = new FormData(quizForm);
        const goals = formData.getAll('q3_goal');
        const statusValue = formData.get('q2_status') === 'אחר' && q2OtherText
          ? (q2OtherText.value.trim() || 'אחר')
          : formData.get('q2_status');

        const submitBtn = document.getElementById('quiz-submit-btn');
        if (submitBtn) submitBtn.disabled = true;

        const now = new Date();
        try {
          await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              'מקור הפנייה': 'שאלון התאמה',
              // Links this quiz submission back to the original lead
              // submission (same lead_id) and repeats the contact details
              // directly here too, so the quiz answers are immediately
              // readable without having to cross-reference two Formspree
              // entries by hand.
              'מזהה ליד': currentLead ? currentLead.leadId : null,
              'שם הליד': currentLead ? currentLead.name : null,
              'טלפון הליד': currentLead ? currentLead.phone : null,
              'גיל הליד': currentLead ? currentLead.age : null,
              'מקור הליד': currentLead ? currentLead.location : null,
              'סוג התהליך המבוקש': formData.get('q1_process'),
              'מצב חיים': statusValue,
              'מטרות': goals.join(' | '),
              'ניסיון בהשקעות': formData.get('q4_experience'),
              'מה כבר ניסו לעשות': formData.get('q5_tried'),
              'מצב עו״ש': formData.get('q6_balance'),
              'סך חסכונות': formData.get('q7_savings'),
              'חיסכון חודשי': formData.get('q8_monthly_savings'),
              'רמת חשיבות (1-5)': formData.get('q9_importance'),
              'תאריך': now.toLocaleDateString('he-IL'),
              'שעה': now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
            }),
          });
        } catch (err) {
          // Even if the network request fails, don't block the user with an
          // error here - the lead's contact details were already captured by
          // the lead form itself; this is bonus context.
        }

        quizForm.hidden = true;
        if (quizThankYou) quizThankYou.hidden = false;
      });
    }
  }

  /* ===== 3. SMOOTH SCROLL (also used by the hero CTA to scroll to the lead form) =====
     A plain, classic ease-out scroll straight to the target. The earlier
     "self-correcting" versions of this (re-measuring and nudging every frame)
     fixed the undershoot but caused visible stutter instead. The real fix for
     the undershoot is below: the feedback/portfolio images between the hero
     and the target were lazy-loading and growing the page WHILE this scroll
     ran, moving the target further down mid-flight - now fixed by loading
     those images eagerly so their space is already reserved before anyone
     can click the hero CTA. With that root cause gone, a single native
     smooth scroll is all that's needed. */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.id === 'hero-cta-open-modal') return; // opens the popup instead - handled above
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ===== 4. LIGHTBOX — click any image (lecture carousel / feedback / portfolio) to enlarge ===== */
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.lightbox-trigger').forEach(el => {
      el.addEventListener('click', () => {
        const img = el.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || 'תמונה מוגדלת';
          lightbox.classList.add('active');
        }
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxClose) {
        lightbox.classList.remove('active');
      }
    });
  }

  /* The lecture carousel now moves on its own via a continuous CSS animation
     (see .lecture-slider-track in style.css) — no JS driver needed, it just loops. */

  /* ===== LECTURE HOVER PREVIEW — no click, just hover to peek at full size ===== */
  const lecturePreview = document.getElementById('lecture-preview-overlay');
  const lecturePreviewImg = document.getElementById('lecture-preview-img');

  if (lecturePreview && lecturePreviewImg) {
    document.querySelectorAll('.lecture-slide').forEach(slide => {
      slide.addEventListener('mouseenter', () => {
        const img = slide.querySelector('img');
        if (img) {
          lecturePreviewImg.src = img.src;
          lecturePreviewImg.alt = img.alt || 'הרצאה';
          lecturePreview.classList.add('active');
        }
      });
      slide.addEventListener('mouseleave', () => {
        lecturePreview.classList.remove('active');
      });
    });
  }

  /* ===== 5. SCROLL-REVEAL — subtle one-time fade+rise as sections enter the viewport ===== */
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target); // one-time only
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px 300px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ===== 6. CARD-DEALING ANIMATION — feedback & portfolio galleries =====
     Uses a single requestAnimationFrame loop (timestamp-based) instead of
     ~20 independent setTimeout calls. Many simultaneous timers under load
     each trigger their own style recalculation slightly out of sync with
     the browser's paint cycle, which reads as stutter; one rAF loop stays
     in lockstep with actual frames, so the stagger looks smooth instead. */
  document.querySelectorAll('.card-deal-trigger').forEach(trigger => {
    const cards = trigger.querySelectorAll('.collage-card');

    const dealOut = () => {
      const start = performance.now();
      const stagger = 18;
      let nextIndex = 0;

      function tick(now) {
        const elapsed = now - start;
        while (nextIndex < cards.length && nextIndex * stagger <= elapsed) {
          cards[nextIndex].classList.add('dealt');
          nextIndex++;
        }
        if (nextIndex < cards.length) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    const gatherBack = () => {
      cards.forEach(card => card.classList.remove('dealt'));
    };

    if ('IntersectionObserver' in window) {
      let hasEntered = false;
      const dealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            hasEntered = true;
            dealOut();
          } else if (hasEntered && entry.boundingClientRect.top > 0) {
            // left the section by scrolling back up past it
            gatherBack();
          }
        });
      }, { threshold: 0.2 });

      dealObserver.observe(trigger);
    } else {
      cards.forEach(card => card.classList.add('dealt'));
    }
  });

  /* ===== 7. ACCESSIBILITY WIDGET ===== */
  const a11yToggleBtn = document.getElementById('a11y-toggle-btn');
  const a11yPanel = document.getElementById('a11y-panel');
  const a11yCloseBtn = document.getElementById('a11y-panel-close');
  const a11yResetBtn = document.getElementById('a11y-reset-btn');
  const a11yGuide = document.getElementById('a11y-reading-guide');
  const a11yStorageKey = 'a11y-settings';

  // Every feature is a simple on/off switch - one click turns it on, the next turns it off.
  const a11yToggles = [
    { id: 'a11y-switch-larger', className: 'a11y-text-larger', exclusiveWith: 'a11y-text-smaller' },
    { id: 'a11y-switch-smaller', className: 'a11y-text-smaller', exclusiveWith: 'a11y-text-larger' },
    { id: 'a11y-switch-font', className: 'a11y-readable-font' },
    { id: 'a11y-switch-links', className: 'a11y-mark-links' },
    { id: 'a11y-switch-contrast', className: 'a11y-high-contrast' },
    { id: 'a11y-switch-mono', className: 'a11y-monochrome' },
    { id: 'a11y-switch-motion', className: 'a11y-no-motion' },
    { id: 'a11y-switch-cursor', className: 'a11y-big-cursor' },
    { id: 'a11y-switch-guide', className: 'a11y-reading-guide-on' },
  ];

  function a11ySetToggle(toggle, on) {
    const btn = document.getElementById(toggle.id);
    document.documentElement.classList.toggle(toggle.className, on);
    if (btn) btn.setAttribute('aria-pressed', String(on));

    // Larger and smaller text are mutually exclusive
    if (on && toggle.exclusiveWith) {
      const other = a11yToggles.find(t => t.className === toggle.exclusiveWith);
      if (other) a11ySetToggle(other, false);
    }
  }

  function a11ySaveSettings() {
    const active = a11yToggles
      .filter(t => document.documentElement.classList.contains(t.className))
      .map(t => t.className);
    try {
      localStorage.setItem(a11yStorageKey, JSON.stringify({ toggles: active }));
    } catch (e) { /* private browsing, ignore */ }
  }

  if (a11yToggleBtn && a11yPanel) {
    a11yToggles.forEach(toggle => {
      const btn = document.getElementById(toggle.id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOn = btn.getAttribute('aria-pressed') === 'true';
        a11ySetToggle(toggle, !isOn);
        a11ySaveSettings();
      });
    });

    // Reading guide bar follows the mouse vertically
    if (a11yGuide) {
      document.addEventListener('mousemove', (e) => {
        if (document.documentElement.classList.contains('a11y-reading-guide-on')) {
          a11yGuide.style.top = (e.clientY - 20) + 'px';
        }
      });
    }

    a11yToggleBtn.addEventListener('click', () => {
      const isHidden = a11yPanel.hasAttribute('hidden');
      if (isHidden) {
        a11yPanel.removeAttribute('hidden');
        a11yToggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        a11yPanel.setAttribute('hidden', '');
        a11yToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    if (a11yCloseBtn) {
      a11yCloseBtn.addEventListener('click', () => {
        a11yPanel.setAttribute('hidden', '');
        a11yToggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    if (a11yResetBtn) {
      a11yResetBtn.addEventListener('click', () => {
        a11yToggles.forEach(t => a11ySetToggle(t, false));
        a11ySaveSettings();
      });
    }

    // Close panel with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !a11yPanel.hasAttribute('hidden')) {
        a11yPanel.setAttribute('hidden', '');
        a11yToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Restore saved settings on load
    try {
      const saved = JSON.parse(localStorage.getItem(a11yStorageKey) || '{}');
      if (Array.isArray(saved.toggles)) {
        a11yToggles.forEach(t => {
          if (saved.toggles.includes(t.className)) a11ySetToggle(t, true);
        });
      }
    } catch (e) { /* ignore corrupt/unavailable storage */ }
  }

  /* ===== DEV PREVIEW SHORTCUT — visit the page with #preview-quiz in the URL
     to open the onboarding quiz instantly, with no need to submit a form or
     use DevTools. Harmless to leave in; nobody will type this by accident. ===== */
  if (window.location.hash === '#preview-quiz' && typeof openOnboardingQuiz === 'function') {
    openOnboardingQuiz();
  }

});
