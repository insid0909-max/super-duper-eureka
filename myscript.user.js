// ==UserScript==
// @name         통합 우클릭 해제 (네이버 블로그 완벽 대응)
// @namespace    http://tampermonkey.net/
// @version      4.3
// @description  네이버 블로그 iframe 포함 모든 사이트 우클릭/복사 해제
// @author       UserScript
// @match        *://*/*
// @exclude      *://*.bank.*
// @exclude      *://*.card.*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 이벤트 핸들러 중지 함수
    const clearEvents = (e) => {
        e.stopPropagation();
        // stopImmediatePropagation은 동일 요소의 다른 리스너도 막습니다.
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        return true;
    };

    // 2. 주요 차단 이벤트 해제
    const events = ['contextmenu', 'copy', 'selectstart', 'dragstart', 'mousedown', 'mouseup'];
    
    const applyToDoc = (doc) => {
        events.forEach(event => {
            doc.addEventListener(event, clearEvents, true); // 캡처링 단계에서 먼저 가로챔
        });
        
        // CSS 강제 주입
        const styleId = 'unlock-css-v4';
        if (!doc.getElementById(styleId)) {
            const style = doc.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                * {
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    user-select: text !important;
                    -webkit-touch-callout: default !important;
                    pointer-events: auto !important;
                }
            `;
            (doc.head || doc.documentElement).appendChild(style);
        }
    };

    // 3. 실행 및 주기적 확인 (네이버 블로그의 동적 로딩 대응)
    applyToDoc(document);
    
    // 네이버 블로그는 메인 프레임이 늦게 뜰 수 있으므로 1초마다 재확인 (성능 영향 미비)
    setInterval(() => {
        applyToDoc(document);
        // iframe 내부까지 접근 시도 (동일 도메인인 경우만 가능)
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    applyToDoc(iframe.contentDocument);
                }
            } catch (e) {
                // 타 도메인 프레임 에러 무시
            }
        });
    }, 1500);

})();
