// ==UserScript==
// @name         NewToki & BlackToon Bypass Engine (v5.0 Master)
// @namespace    https://github.com/
// @version      5.0
// @description  클라우드플레어 역감지 트랩 및 인라인 trip 함수 완전 폭파 엔진
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
    GM_registerMenuCommand(isEnabled ? "✅ 광고 차단 우회 엔진 작동 중" : "❌ 광고 차단 우회 엔진 꺼짐", function() {
        GM_setValue("bypass_enabled", !isEnabled);
        location.reload();
    });

    if (!isEnabled) return;

    // [강력 패치 1] 화면을 강제로 잠그는 저들의 핵심 'trip' 무한 루프 함수를 원천 삭제 및 바보화
    const dummyFn = function() { return false; };
    
    try {
        Object.defineProperty(window, 'trip', {
            get: () => dummyFn,
            set: () => {},
            configurable: false
        });
        Object.defineProperty(window, 'checkDevTools', {
            get: () => dummyFn,
            set: () => {},
            configurable: false
        });
    } catch (_) {
        window.trip = dummyFn;
        window.checkDevTools = dummyFn;
    }

    // [강력 패치 2] 로컬스토리지 경고 카운트 상시 초기화 및 무력화
    try {
        localStorage.setItem("ntk_dev_warn", "0");
        Object.defineProperty(localStorage, 'ntk_dev_warn', { value: "0", writable: false });
    } catch (_) {}

    // [강력 패치 3] 블랙스크린 오버레이 레이어 및 스크롤 마비 실시간 강제 철거
    const destroyBypassGates = () => {
        window.__ntk_ib_ok = 1;
        window.__ntkDevtoolsPreflight = 1;
        window.__ntkDevtoolsTripped = false;

        // 차단 오버레이가 보이면 즉시 삭제하고 화면 원래대로 복구
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) {
            overlay.remove();
        }
        
        // 저들이 고정해둔 모든 화면 잠금 스타일 초기화 (스크롤 버그 완벽 해결)
        if (document.body && document.documentElement) {
            document.body.style.setProperty("overflow", "auto", "important");
            document.documentElement.style.setProperty("overflow", "auto", "important");
            document.body.style.setProperty("user-select", "auto", "important");
            document.documentElement.style.setProperty("user-select", "auto", "important");
        }
    };

    // [강력 패치 4] 구글 강제 리디렉션 납치 원천 봉쇄
    try {
        const originalReplace = window.location.replace;
        window.location.replace = function(url) {
            if (url.includes("google.com")) return null;
            return originalReplace.apply(this, arguments);
        };
    } catch(_) {}

    // 0.01초 단위 실시간 무한 청소단 가동
    destroyBypassGates();
    const observer = new MutationObserver(() => destroyBypassGates());
    
    document.addEventListener('DOMContentLoaded', () => {
        destroyBypassGates();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    
    window.addEventListener('load', destroyBypassGates);
})();
