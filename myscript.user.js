// ==UserScript==
// @name         통합 우클릭 및 이미지 보호 해제 (v4.0)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  네이버 카페, 블로그 및 강력 보안 사이트의 우클릭/드래그/이미지 보호를 해제합니다.
// @author       Gemini
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 모든 차단 이벤트를 무력화 (캡처링 단계에서 선점)
    const events = ['contextmenu', 'copy', 'cut', 'paste', 'mousedown', 'mouseup', 'selectstart', 'dragstart'];
    const handler = (e) => {
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    };

    events.forEach(event => {
        document.addEventListener(event, handler, true);
        window.addEventListener(event, handler, true);
    });

    // 2. CSS 및 요소 속성 강제 변경 (Method 6, 7, 8 대응)
    const unlock = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            /* 모든 요소 드래그 및 선택 가능하게 강제 */
            * {
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                user-select: text !important;
                pointer-events: auto !important;
            }
            /* 이미지 위 투명 레이어 무력화 */
            div:empty, span:empty {
                pointer-events: none !important;
                display: none !important;
            }
            img {
                -webkit-touch-callout: default !important;
            }
        `;
        document.documentElement.appendChild(style);

        // 인라인 속성 제거
        document.body.oncontextmenu = null;
        document.body.onselectstart = null;
        document.body.ondragstart = null;
        document.body.onmousedown = null;
    };

    // 로드 시점에 맞춰 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', unlock);
    } else {
        unlock();
    }

    // 페이지가 동적으로 변할 때(무한 스크롤 등) 다시 실행
    const observer = new MutationObserver(unlock);
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
