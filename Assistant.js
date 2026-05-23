// ==UserScript==
// @name         NewToki & BlackToon Anti-Adblock Bypass Engine (Force Clear)
// @namespace    https://github.com/
// @version      2.0
// @description  애드블록 감지 레이어 실시간 강제 삭제 및 파괴 엔진
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
    GM_registerMenuCommand(isEnabled ? "✅ 광고 차단 팝업 우회 중" : "❌ 광고 차단 팝업 우회 끔", function() {
        GM_setValue("bypass_enabled", !isEnabled);
        location.reload();
    });

    if (!isEnabled) return;

    // 1. 화면에 뜨는 블랙스크린 차단 레이어를 실시간으로 감지하자마자 삭제 (핵심)
    const destroyOverlay = () => {
        // 소스 코드에 명시된 오버레이 ID 타겟팅
        const overlay = document.getElementById("ntk_devtools_overlay");
        if (overlay) {
            overlay.remove(); // 발견 즉시 삭제
            
            // 차단기가 마비시켜놓은 브라우저 스크롤 및 선택 기능 강제 복구
            document.documentElement.style.removeProperty("user-select");
            document.body.style.removeProperty("overflow");
            document.documentElement.style.setProperty("user-select", "auto", "important");
            document.body.style.setProperty("overflow", "auto", "important");
        }
    };

    // 2. 서버 사이드 플래그 및 변수 강제 주입
    const forceFlags = () => {
        window.__ntk_ib_ok = 1;
        window.__ntkDevtoolsPreflight = 1;
        window.__ntkDevtoolsTripped = false;
        
        // Next.js 빌드 세팅 내부의 차단 플래그 강제 다운
        if (window.__next_f) {
            const originalPush = window.__next_f.push;
            window.__next_f.push = function(...args) {
                let str = JSON.stringify(args);
                if (str.includes("devToolsBlockerEnabled")) {
                    // 차단 게이트웨이 활성화 옵션을 소스 안에서 false로 치환
                    str = str.replace(/"devToolsBlockerEnabled":true/g, '"devToolsBlockerEnabled":false');
                    args = JSON.parse(str);
                }
                return originalPush.apply(this, args);
            };
        }
    };

    // 3. 실시간 감시단(MutationObserver) 가동 - 사이트가 레이어를 생성하는 찰나에 격추
    const observer = new MutationObserver((mutations) => {
        destroyOverlay();
    });

    // 브라우저가 준비되는 즉시 실시간 감시 시작
    forceFlags();
    destroyObserver();
    
    document.addEventListener('DOMContentLoaded', () => {
        forceFlags();
        destroyOverlay();
        observer.observe(document.documentElement, { childList: true, subtree: true });
    });

    window.addEventListener('load', () => {
        destroyOverlay();
    });
})();
