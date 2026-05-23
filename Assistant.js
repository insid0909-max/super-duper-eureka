// ==UserScript==
// @name         NewToki & BlackToon Anti-Adblock Bypass Engine (v5.1 Smart Scroll)
// @namespace    https://github.com/
// @version      5.1
// @description  광고 차단 완벽 우회 + 내리면 사라지고 올리면 나타나는 순정 스크롤 바 완벽 복구
// @author       지혁 (AI Collaborator)
// @match        *://*.sbxh2.com/*
// @match        *://*.blacktoon*.com/*
// @match        *://*.newtoki*.com/*
// @match        *://*.manatoki*.com/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    let isEnabled = GM_getValue("bypass_enabled", true);
    GM_registerMenuCommand(isEnabled ? "✅ 우회 및 스크롤 엔진 가동 중" : "❌ 엔진 꺼짐", function() {
        GM_setValue("bypass_enabled", !isEnabled);
        location.reload();
    });

    if (!isEnabled) return;

    // [패치 1] 안티 블로커 trip 함수 무력화 (블랙 스크린 차단)
    const dummyFn = function() { return false; };
    try {
        Object.defineProperty(window, 'trip', { get: () => dummyFn, set: () => {}, configurable: false });
        Object.defineProperty(window, 'checkDevTools', { get: () => dummyFn, set: () => {}, configurable: false });
    } catch (_) {
        window.trip = dummyFn; window.checkDevTools = dummyFn;
    }

    try {
        localStorage.setItem("ntk_dev_warn", "0");
        Object.defineProperty(localStorage, 'ntk_dev_warn', { value: "0", writable: false });
    } catch (_) {}

    const destroyOverlay = () => {
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) overlay.remove();
    };

    // [패치 2] 인공지능 스크롤 센서 주입 (내리면 숨기고, 조금만 올리면 즉시 다시 나타나게 제작)
    let lastScrollTop = 0;
    const delta = 10; // 스크롤을 최소 10px 이상 조작했을 때만 민감하게 반응하도록 설정

    const handleSmartScroll = () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(lastScrollTop - st) <= delta) return;

        // 고유 난수 클래스를 회피하기 위해 와일드카드 기법으로 상하단/우측바 전체 타겟팅
        const selectors = 'header, .nav, main ~ div, div[class*="Viewer_top"], div[class*="Viewer_bottom"], div[class*="Floating"], div[class*="Menu"]';
        const elements = document.querySelectorAll(selectors);

        if (st > lastScrollTop && st > 100) {
            // ➔ 아래로 스크롤 시: 화면 밖으로 깔끔하게 숨김 (사라짐)
            elements.forEach(el => {
                el.style.setProperty("transition", "transform 0.3s ease-out", "important");
                if (el.tagName === 'HEADER' || el.className.includes('top')) {
                    el.style.setProperty("transform", "translateY(-100%)", "important");
                } else if (el.className.includes('bottom')) {
                    el.style.setProperty("transform", "translateY(100%)", "important");
                } else {
                    // 우측 플로팅 바 등은 오른쪽으로 숨김
                    el.style.setProperty("transform", "translateX(150%)", "important");
                }
            });
        } else {
            // ➔ 위로 조금만 올릴 시: 원래 자리로 부드럽게 다시 등장! (나타남)
            elements.forEach(el => {
                el.style.setProperty("transition", "transform 0.25s ease-in-out", "important");
                el.style.setProperty("transform", "none", "important");
                // 혹시 모를 고정 스타일 복구
                el.style.setProperty("position", "fixed", "important");
                document.body.style.setProperty("overflow", "auto", "important");
                document.documentElement.style.setProperty("overflow", "auto", "important");
            });
        }
        lastScrollTop = st;
    };

    // 모든 시점마다 감시 및 스크롤 이벤트 바인딩
    destroyOverlay();
    const observer = new MutationObserver(() => destroyOverlay());
    
    document.addEventListener('DOMContentLoaded', () => {
        destroyOverlay();
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.addEventListener('scroll', handleSmartScroll, { passive: true });
    });
    
    window.addEventListener('load', () => {
        destroyOverlay();
        window.addEventListener('scroll', handleSmartScroll, { passive: true });
    });
})();
