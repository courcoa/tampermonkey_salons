// ==UserScript==
// @name         Correction Nom/Prénom + Acceptations + Bandeau (Tactile & Souris)
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description  Corrige nom/prénom, coche mail & sms, affiche un bandeau, compatible souris + tactile
// @match        https://salon2.hairnet.fr/management/fiche-client.php*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Crée le bandeau de confirmation
  const banner = document.createElement('div');
  banner.innerText = 'Formatage automatique activé';
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    padding: '6px 0',
    backgroundColor: '#4CAF50',
    color: 'white',
    textAlign: 'center',
    fontSize: '14px',
    fontFamily: 'sans-serif',
    zIndex: '10000',
    opacity: '0',
    transition: 'opacity 0.3s ease'
  });
  document.body.appendChild(banner);

  let hideTimer;

  function showBanner() {
    clearTimeout(hideTimer);
    banner.style.opacity = '1';
    hideTimer = setTimeout(() => {
      banner.style.opacity = '0';
    }, 2000);
  }

  function autoCorrect(field) {
    if (!field || !field.name) return;

    if (field.name === 'clt_nom') {
      field.value = field.value.toUpperCase();
    } else if (field.name === 'clt_prenom') {
      field.value = field.value
        .split(/[\s-]+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join('-');
    } else if (field.name === 'clt_accept_mail' || field.name === 'clt_accept_sms') {
      field.checked = true;
    }
  }

  function checkAcceptBoxes() {
    const acceptMail = document.querySelector('input[name="clt_accept_mail"]');
    const acceptSms = document.querySelector('input[name="clt_accept_sms"]');

    if (acceptMail) acceptMail.checked = true;
    if (acceptSms) acceptSms.checked = true;
  }

  // Détection des changements dans les inputs pour correction
  document.body.addEventListener('input', function (e) {
    const t = e.target;
    if (t.tagName.toLowerCase() === 'input' &&
      (t.name === 'clt_nom' || t.name === 'clt_prenom' ||
        t.name === 'clt_accept_mail' || t.name === 'clt_accept_sms')) {
      autoCorrect(t);
      showBanner();
    }
  }, true);

  // Observe les éléments ajoutés dynamiquement
  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.tagName === 'INPUT' &&
          (node.name === 'clt_nom' || node.name === 'clt_prenom' ||
            node.name === 'clt_accept_mail' || node.name === 'clt_accept_sms')) {
          autoCorrect(node);
        }
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Compatibilité totale : souris, tactile, stylet
  ['click', 'touchstart', 'pointerdown'].forEach(evtType => {
    document.body.addEventListener(evtType, () => {
      checkAcceptBoxes();
      showBanner();
    }, { passive: true });
  });

})();