// ==UserScript==
// @name         NewToki & BlackToon Anti-Adblock Bypass Engine (v4.2 Ultimate Scroll Fix)
// @namespace    https://github.com/
// @version      4.2
// @description  애드블록 완벽 우회 + 상하단 상태바 스크롤 숨김 기능 100% 정상화
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

    // [중요 패치] 상하단 메뉴바 숨김 로직을 가로막던 전역 변수들의 강제 고정 방식을 해제하고 
    // 사이트가 내부적으로 스크롤을 인식할 수 있도록 순정 변수 상태로 우회 처리
    window.__ntk_ib_ok = window.__ntk_ib_ok || 1;
    
    // 이프레임 가로채기 방어 및 디버거 가드 파괴 함수
    const neutralizeGates = () => {
        const dummy = function() { return null; };
        const gates = ['DevToolsBlockerGate', 'DevToolsBlocker', 'AdBlockGuard', 'InitBlockGuard', 'checkDevTools', 'trip'];
        
        gates.forEach(g => {
            try {
                if (window[g] !== dummy) {
                    window[g] = dummy;
                }
            } catch(_) {}
        });

        // 팝업 오버레이 레이어는 발견 즉시 화면에서 완전히 제거하되, 메인 스크롤 흐름은 절대 건드리지 않음
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) {
            overlay.remove();
            // 스타일 강제 고정 해제법 수정
            document.body.style.removeProperty("overflow");
        }
    };

    // 로컬스토리지 경고 카운트 롤백
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

    // 구글 강제 이동 리디렉션 킬러
    try {
        const originalReplace = window.location.replace;
        window.location.replace = function(url) {
            if (url.includes("google.com")) return null;
            return originalReplace.apply(this, arguments);
        };
    } catch(_) {}

    // 실행 루틴 구조 고도화 (사이트 UI 엔진의 스크롤 리스너가 먼저 안착하도록 유도)
    neutralizeGates();
    const observer = new MutationObserver(() => neutralizeGates());
    
    document.addEventListener('DOMContentLoaded', () => {
        neutralizeGates();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    
    window.addEventListener('load', neutralizeGates);
})();
