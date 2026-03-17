// ==UserScript==
// @name         통합 우클릭 해제 (네이버 블로그 완벽 대응)
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  네이버 블로그 iframe 포함 모든 사이트 우클릭/복사 해제
// @author       UserScript
// @match        *://*/*
// @exclude      *://*.bank.*/*
// @exclude      *://bank.*/*
// @exclude      *://*.card.*/*
// @exclude      *://card.*/*
// @exclude      *://*.kakaobank.com/*
// @exclude      *://*.kbstar.com/*
// @exclude      *://*.shinhan.com/*
// @exclude      *://*.hanabank.com/*
// @exclude      *://*.wooribank.com/*
// @exclude      *://*.nhbank.com/*
// @exclude      *://*.ibk.co.kr/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 이벤트 핸들러 — return true 제거, stopPropagation만 수행
    const clearEvents = (e) => {
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    };

    // 2. mousedown/mouseup 제거 — UI 부작용 방지
    const events = ['contextmenu', 'copy', 'selectstart', 'dragstart'];

    // 3. WeakSet으로 중복 등록 방지
    const applied = new WeakSet();

    const applyToDoc = (doc) => {
        if (applied.has(doc)) return;
        applied.add(doc);

        events.forEach(event => {
            doc.addEventListener(event, clearEvents, true);
        });

        // CSS 강제 주입 (중복 방지는 WeakSet이 커버하므로 styleId 체크 유지)
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

    // 4. 초기 실행
    applyToDoc(document);

    // 5. 동적 로딩 및 iframe 대응 (1,500ms 간격)
    setInterval(() => {
        applyToDoc(document); // WeakSet으로 중복 처리 없음
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (iframe.contentDocument) {
                    applyToDoc(iframe.contentDocument);
                }
            } catch (e) {
                // cross-origin 프레임 접근 오류 무시
            }
        });
    }, 1500);

})();
