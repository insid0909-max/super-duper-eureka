// ==UserScript==
// @name         통합 우클릭 해제 (안정화 v4.1)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  인터넷 멈춤 현상을 수정한 안정화 버전입니다.
// @author       Gemini
// @match        *://*/*
// @exclude      *://*.bank.*
// @exclude      *://*.card.*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 1. 차단할 이벤트 리스트 (필수적인 것만 선별)
    const events = ['contextmenu', 'copy', 'selectstart', 'dragstart'];
    
    const handler = (e) => {
        e.stopPropagation();
    };

    // 2. 이벤트 리스너 등록 (캡처링 지양, 속도 향상)
    events.forEach(event => {
        document.addEventListener(event, handler, false);
    });

    // 3. CSS 강제 주입 (성능 최적화)
    const unlockCSS = () => {
        if (document.getElementById('gemini-unlock-css')) return;
        const style = document.createElement('style');
        style.id = 'gemini-unlock-css';
        style.innerHTML = `
            * {
                -webkit-user-select: text !important;
                user-select: text !important;
                -webkit-touch-callout: default !important;
            }
        `;
        document.documentElement.appendChild(style);
    };

    // 페이지 로드 후 1번만 실행
    window.addEventListener('load', unlockCSS);
})();
