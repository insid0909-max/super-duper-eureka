// ==UserScript==
// @name         통합 우클릭 해제 (네이버 블로그 완벽 대응)
// @namespace    http://tampermonkey.net/
// @version      4.5
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

    // 1. 이벤트 핸들러
    const clearEvents = (e) => {
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    };

    // 2. 대상 이벤트
    const events = ['contextmenu', 'copy', 'selectstart', 'dragstart'];

    // 3. WeakSet으로 중복 등록 방지
    const applied = new WeakSet();

    // 4. 유니콘 프로 관련 iframe 판별
    const isUnicornFrame = (iframe) => {
        const src = iframe.src || '';
        const id = iframe.id || '';
        const cls = iframe.className || '';
        return ['unicorn', 'adguard', 'ublock', 'adblock'].some(keyword =>
            src.includes(keyword) || id.includes(keyword) || cls.includes(keyword)
        );
    };

    const applyToDoc = (doc) => {
        if (applied.has(doc)) return;
        applied.add(doc);

        events.forEach(event => {
            doc.addEventListener(event, clearEvents, true);
        });

        // CSS 강제 주입 — pointer-events 제거로 유니콘 프로 UI 충돌 방지
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
                }
            `;
            (doc.head || doc.documentElement).appendChild(style);
        }
    };

    // 5. 초기 실행
    applyToDoc(document);

    // 6. 동적 로딩 및 iframe 대응 — 유니콘 프로 iframe 제외
    setInterval(() => {
        applyToDoc(document);
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (isUnicornFrame(iframe)) return; // 유니콘 프로 iframe 건너뜀
                if (iframe.contentDocument) {
                    applyToDoc(iframe.contentDocument);
                }
            } catch (e) {
                // cross-origin 프레임 접근 오류 무시
            }
        });
    }, 1500);

})();
