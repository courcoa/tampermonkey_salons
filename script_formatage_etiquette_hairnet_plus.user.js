// ==UserScript==
// @name         Formattage automatique des étiquettes
// @namespace    http://tampermonkey.net/
// @version      2026-09-21
// @description  Reprend automatiquement les paramètres du gestionnaire d'étiquettes de Hairnet+ et modification du CSS pour l'impression.
// @author       Arno COURCOUX
// @match        https://hairnetplus.app/etiquettes
// @updateURL    https://github.com/courcoa/tampermonkey_salons/script_formatage_etiquette_hairnet_plus.user.js
// @downloadURL  https://github.com/courcoa/tampermonkey_salons/script_formatage_etiquette_hairnet_plus.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hairnetplus.app
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ==========================================
    // CSS
    // ==========================================

    function configurerStylesCSS() {

        // Taille du prix
        const prixLabels = document.querySelectorAll('.prix-label');

        prixLabels.forEach(element => {

            element.style.fontSize = '30px';

        });

        // Hauteur minimale de la marque
        const marqueLabels = document.querySelectorAll('.marque-label');

        marqueLabels.forEach(element => {

            element.style.minHeight = '11px';

        });

        // Hauteur minimale du produit
        const produitLabels = document.querySelectorAll('.produit-label');

        produitLabels.forEach(element => {

            element.style.minHeight = '29px';

        });

        // Hauteur minimale de la contenance
        const contenanceLabels = document.querySelectorAll('.contenance-label');

        contenanceLabels.forEach(element => {

            element.style.minHeight = '10px';

        });

        // Retirer la bordure inférieure de l'en-tête
        document.querySelectorAll('.entete-label').forEach(element => {

            element.style.borderBottom = 'none';

        });
    }

    // ==========================================
    // CONFIGURATION
    // ==========================================

    const VALEURS = {
        rows: '8',
        gap: '0',
        mTop: '18',
        mBot: '18',
        mLeft: '4',
        mRight: '4'
    };

    let clicMinimalEnCours = false;
    let clicEANEnCours = false;

    // ==========================================
    // 1. MODIFIER LES CHAMPS
    // ==========================================

    function configurerChamps() {

        Object.entries(VALEURS).forEach(([field, valeur]) => {

            const element = document.querySelector(
                `[data-field="${field}"]`
            );

            if (!element) return;

            if ('value' in element) {

                if (element.value !== valeur) {

                    // Utilise le setter natif pour les inputs
                    const prototype = Object.getPrototypeOf(element);
                    const descriptor = Object.getOwnPropertyDescriptor(
                        prototype,
                        'value'
                    );

                    if (descriptor && descriptor.set) {
                        descriptor.set.call(element, valeur);
                    } else {
                        element.value = valeur;
                    }

                    element.dispatchEvent(
                        new Event('input', { bubbles: true })
                    );

                    element.dispatchEvent(
                        new Event('change', { bubbles: true })
                    );

                }

            } else {

                if (element.textContent !== valeur) {
                    element.textContent = valeur;
                }

            }

        });

    }

    // ==========================================
    // 2. ACTIVER CODE ARTICLE (EAN) PAR CLIC
    // ==========================================

    function activerCodeEAN() {

        if (clicEANEnCours) return;

        const spans = document.querySelectorAll('span');

        for (const span of spans) {

            if (
                span.textContent.trim() !== 'Code article (EAN)'
            ) continue;

            const parent = span.parentElement;

            if (!parent) return;

            // Si déjà actif, inutile de cliquer
            if (parent.classList.contains('active')) {
                return;
            }

            clicEANEnCours = true;

            console.log(
                '[Tampermonkey] Simulation du clic sur le span Code EAN'
            );

            // Simuler les événements de la souris sur le span
            ['mousedown', 'mouseup', 'click'].forEach(type => {

                const event = new MouseEvent(type, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    buttons: 1
                });

                span.dispatchEvent(event);

            });

            // Laisser Angular mettre à jour son état
            setTimeout(() => {
                clicEANEnCours = false;
            }, 500);

            return;

        }

    }

    // ==========================================
    // 3. ACTIVER LE STYLE MINIMAL PAR CLIC
    // ==========================================

    function activerStyleMinimal() {

        if (clicMinimalEnCours) return;

        const options = document.querySelectorAll(
            'div.style-option'
        );

        for (const option of options) {

            // Récupérer uniquement le texte directement présent
            // dans le div, sans le texte du span (icône)
            const texte = Array.from(option.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join('');

            if (texte !== 'Minimal') continue;

            // Si Minimal est déjà actif, aucune action
            if (option.classList.contains('active')) {
                return;
            }

            clicMinimalEnCours = true;

            console.log(
                '[Tampermonkey] Clic sur le style Minimal'
            );

            // Simuler un vrai clic utilisateur
            option.click();

            // Laisser Angular mettre à jour son état
            setTimeout(() => {
                clicMinimalEnCours = false;
            }, 300);

            return;

        }

    }

    // ==========================================
    // 4. FONCTION PRINCIPALE
    // ==========================================

    function appliquerConfiguration() {

        configurerChamps();

        activerCodeEAN();

        activerStyleMinimal();

        configurerStylesCSS();

    }

    // ==========================================
    // 5. SURVEILLANCE DYNAMIQUE DU DOM
    // ==========================================

    let programmationEnCours = false;

    function programmerConfiguration() {

        if (programmationEnCours) return;

        programmationEnCours = true;

        // Regroupe les modifications rapprochées
        setTimeout(() => {

            programmationEnCours = false;

            appliquerConfiguration();

        }, 100);

    }

    // ==========================================
    // 6. OBSERVER LA PAGE
    // ==========================================

    function demarrerObservation() {

        if (!document.body) return;

        const observer = new MutationObserver(() => {

            programmerConfiguration();

        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'value']
        });

        // Première exécution
        appliquerConfiguration();

        console.log(
            '[Tampermonkey] Configuration automatique activée'
        );

    }

    // ==========================================
    // 7. INITIALISATION
    // ==========================================

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            demarrerObservation
        );

    } else {

        demarrerObservation();

    }

})();