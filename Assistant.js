// ==UserScript==
// @name         NewToki & BlackToon Anti-Adblock Bypass Engine (v4.1 Scroll Fix)
// @namespace    https://github.com/
// @version      4.1
// @description  광고 차단 감지는 막고, 스크롤 시 상하단 바 사라지는 기능 원상복구
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

    // [패치 1] 변수를 무조건 1로 만드는 대신, 사이트가 읽어갈 때만 순간적으로 속여 UI 고정 버그 방지
    window.__ntk_ib_ok = 1;
    window.__ntkDevtoolsTripped = false;

    // 메뉴바 스크롤 제어에 영향을 주는 Preflight 값은 undefined로 놔두되, 격추용 trip 함수만 바보로 만듦
    const clearBypassGates = () => {
        const dummy = function() { return null; };
        const gates = ['DevToolsBlockerGate', 'DevToolsBlocker', 'AdBlockGuard', 'InitBlockGuard', 'checkDevTools', 'trip'];
        
        gates.forEach(g => {
            try { window[g] = dummy; } catch(_) {}
        });

        // 차단 레이어가 뜰 때만 저격해서 지우기
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) {
            overlay.remove();
            document.documentElement.style.setProperty("user-select", "auto", "important");
            document.body.style.setProperty("overflow", "auto", "important");
        }
    };

    // [패치 2] localStorage 카운트 마비
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

    // [패치 3] 튕김 방지
    try {
        const originalReplace = window.location.replace;
        window.location.replace = function(url) {
            if (url.includes("google.com")) return null;
            return originalReplace.apply(this, arguments);
        };
    } catch(_) {}

    clearBypassGates();
    const observer = new MutationObserver(() => clearBypassGates());
    
    document.addEventListener('DOMContentLoaded', () => {
        clearBypassGates();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    window.addEventListener('load', clearBypassGates);
})();
