// ==UserScript==
// @name         NewToki & BlackToon Anti-Anti-Adblock Ultimate Engine (v3.0)
// @namespace    https://github.com/
// @version      3.0
// @description  새로 업데이트된 경고 누수 시스템 및 구글 리디렉션 기능 완벽 파괴
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
    GM_registerMenuCommand(isEnabled ? "✅ 광고 차단 우회 엔진 켜짐" : "❌ 광고 차단 우회 엔진 꺼짐", function() {
        GM_setValue("bypass_enabled", !isEnabled);
        location.reload();
    });

    if (!isEnabled) return;

    // [강력조치 1] 사이트가 내 브라우저를 구글로 튕겨내려고 할 때(replace/assign) 주소창 납치 차단
    const rawReplace = window.location.replace;
    try {
        window.location.replace = function(url) {
            if (url.includes("google.com")) {
                console.log("➔ 사이트의 구글 리디렉션 기도를 격추했습니다.");
                return null;
            }
            return rawReplace.apply(this, arguments);
        };
    } catch(_) {}

    // [강력조치 2] 로컬 스토리지 경고 스택 0으로 상시 마비 (차단 누적 방지)
    try {
        localStorage.setItem("ntk_dev_warn", "0");
        Object.defineProperty(localStorage, 'ntk_dev_warn', { value: "0", writable: false });
    } catch(_) {}

    // [강력조치 3] 새로운 감지 기법인 뷰포트 갭 검사 및 포맷터 함수 무조건 '정상' 처리
    Object.defineProperty(window, 'viewportLooksOpen', { get: () => false, set: () => {}, configurable: false });
    Object.defineProperty(window, 'formattersTripped', { get: () => false, set: () => {}, configurable: false });

    // [강력조치 4] Next.js 본문 보안 컴포넌트 원천 바보화
    const killGates = () => {
        window.__ntk_ib_ok = 1;
        window.__ntkDevtoolsPreflight = 1;
        window.__ntkDevtoolsTripped = "none";

        const dummy = function() { return null; };
        const gates = ['DevToolsBlockerGate', 'DevToolsBlocker', 'AdBlockGuard', 'InitBlockGuard', 'AdminBrowserDisguise', 'checkDevTools', 'trip'];
        
        gates.forEach(g => {
            try {
                Object.defineProperty(window, g, { get: () => dummy, set: () => {}, configurable: false });
            } catch(_) {}
        });

        // 눈앞에 팝업창 레이어가 생성되는 즉시 가차 없이 제거
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) {
            overlay.remove();
            document.documentElement.style.setProperty("user-select", "auto", "important");
            document.body.style.setProperty("overflow", "auto", "important");
        }
    };

    // [강력조치 5] 무한 디버거 빌더 원천 봉쇄
    const OrigConstructor = Function.prototype.constructor;
    Function.prototype.constructor = function(...args) {
        if (args.length > 0 && typeof args[0] === 'string' && (args[0].includes('debugger') || args[0].includes('ntk_devtools'))) {
            return function() {};
        }
        return OrigConstructor.apply(this, args);
    };

    // 즉시 실행 및 문서 로드 시점마다 중첩 가동
    killGates();
    const observer = new MutationObserver(() => killGates());
    
    document.addEventListener('DOMContentLoaded', () => {
        killGates();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });
    window.addEventListener('load', killGates);
})();
