// ==UserScript==
// @name         슈퍼 우클릭 해제
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  강력한 보안이 걸린 사이트의 우클릭/드래그 제한을 강제로 해제합니다.
// @author       Gemini
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 이벤트 리스너 완전 차단 (이벤트 캡처링 단계에서 가로챔)
    const bypassEvents = ['contextmenu', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'selectstart', 'dragstart'];
    
    bypassEvents.forEach(eventName => {
        document.addEventListener(eventName, function(e) {
            e.stopPropagation();
        }, true); // true 옵션으로 가장 먼저 실행되게 함
    });

    // 2. 인라인 속성 및 CSS 강제 초기화
    const unlock = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
                pointer-events: auto !important;
            }
        `;
        document.documentElement.appendChild(style);
        
        // 인라인으로 박힌 차단 속성 제거
        document.body.oncontextmenu = null;
        document.body.onselectstart = null;
        document.body.ondragstart = null;
        document.body.onmousedown = null;
    };

    // 페이지 로드 시 및 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', unlock);
    } else {
        unlock();
    }
})();
