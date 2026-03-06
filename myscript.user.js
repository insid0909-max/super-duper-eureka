// ==UserScript==
// @name         강력한 복사 제한 해제
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  우클릭, 드래그, 선택 제한을 모두 해제합니다.
// @author       Gemini
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    const events = ['contextmenu', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'beforecopy', 'beforecut', 'selectstart', 'dragstart'];
    const handler = (e) => { e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); };

    // 이벤트 리스너 차단
    events.forEach(event => {
        window.addEventListener(event, handler, true);
        document.addEventListener(event, handler, true);
    });

    // CSS 강제 적용 (드래그 가능하게)
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }
    `;
    document.documentElement.appendChild(style);
})();
