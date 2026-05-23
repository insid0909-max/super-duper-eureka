// ==UserScript==
// @name         NewToki & BlackToon Anti-Adblock Bypass Engine (v4.0 Ultimate)
// @namespace    https://github.com/
// @version      4.0
// @description  로컬스토리지 변조 방지 및 인라인 trip 기능 영구 동결
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

    // [핵심 패치 1] 저들이 경고 카운트를 쌓는 localStorage의 접근 권한을 뺏어 상시 0으로 고정
    try {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key === "ntk_dev_warn") return originalSetItem.apply(this, [key, "0"]);
            return originalSetItem.apply(this, arguments);
        };
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = function(key) {
            if (key === "ntk_dev_warn") return "0";
            return originalGetItem.apply(this, arguments);
        };
    } catch (_) {}

    // [핵심 패치 2] 창을 덮어버리는 오버레이 레이어 및 스크롤 마비 실시간 강제 해제
    const clearBypassGates = () => {
        window.__ntk_ib_ok = 1;
        window.__ntkDevtoolsPreflight = 1;
        window.__ntkDevtoolsTripped = false;

        const dummy = function() { return null; };
        const gates = ['DevToolsBlockerGate', 'DevToolsBlocker', 'AdBlockGuard', 'InitBlockGuard', 'checkDevTools', 'trip'];
        
        gates.forEach(g => {
            try { window[g] = dummy; } catch(_) {}
        });

        // 차단 레이어가 감지되면 흔적도 없이 삭제
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) {
            overlay.remove();
            document.documentElement.style.setProperty("user-select", "auto", "important");
            document.body.style.setProperty("overflow", "auto", "important");
        }
    };

    // [핵심 패치 3] 구글로 주소창을 날려버리는 팅김 현상 완전 방어
    try {
        const originalReplace = window.location.replace;
        window.location.replace = function(url) {
            if (url.includes("google.com")) {
                console.log("➔ 사이트의 강제 리디렉션을 방어했습니다.");
                return null;
            }
            return originalReplace.apply(this, arguments);
        };
    } catch(_) {}

    // 실행단 가동
    clearBypassGates();
    const observer = new MutationObserver(() => clearBypassGates());
    
    document.addEventListener('DOMContentLoaded', () => {
        clearBypassGates();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    window.addEventListener('load', clearBypassGates);
})();
