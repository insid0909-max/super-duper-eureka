// ==UserScript==
// @name         통합 우클릭 해제 (안정화 v4.2)
// @namespace    http://tampermonkey.net/
// @version      4.2
// @description  개인 정보 제거 및 성능 최적화 버전
// @author       UserScript
// @match        *://*/*
// @exclude      *://*.bank.*
// @exclude      *://*.card.*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const events = ['contextmenu', 'copy', 'selectstart', 'dragstart'];
    const handler = (e) => { e.stopPropagation(); };

    events.forEach(event => {
        document.addEventListener(event, handler, false);
    });

    const unlockCSS = () => {
        if (document.getElementById('unlock-css-clean')) return;
        const style = document.createElement('style');
        style.id = 'unlock-css-clean';
        style.innerHTML = `
            * {
                -webkit-user-select: text !important;
                user-select: text !important;
                -webkit-touch-callout: default !important;
            }
        `;
        document.documentElement.appendChild(style);
    };

    window.addEventListener('load', unlockCSS);
})();
