// ==UserScript==
// @name         NewToki & BlackToon Anti-Adblock Bypass Engine (Menu Version)
// @namespace    https://github.com/
// @version      1.3
// @description  유니콘 Pro 웹 어시스턴트 완벽 연동용 광고 차단 우회 스크립트
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

    // 유니콘 Pro 웹 어시스턴트 메뉴 등록 (동영상처럼 온/오프 상태 저장 가능)
    let isEnabled = GM_getValue("bypass_enabled", true);
    
    GM_registerMenuCommand(isEnabled ? "✅ 광고 차단 팝업 우회 중" : "❌ 광고 차단 팝업 우회 끔", function() {
        GM_setValue("bypass_enabled", !isEnabled);
        location.reload(); // 스위치를 누르면 상태가 저장되고 페이지가 자동 새로고침됩니다.
    });

    // 스위치가 꺼져있으면 우회 기능을 작동하지 않음
    if (!isEnabled) return;

    // 핵심 안티-애드블록 격추 엔진 실행
    const bypassEngine = () => {
        if (!window.__ntk_ib_ok) {
            try { Object.defineProperty(window, '__ntk_ib_ok', { value: 1, writable: false }); } catch(_) {}
        }
        if (!window.__ntkDevtoolsPreflight) {
            try { Object.defineProperty(window, '__ntkDevtoolsPreflight', { value: 1, writable: false }); } catch(_) {}
        }

        const dummyComponent = function() { return null; };
        const targetGates = ['DevToolsBlockerGate', 'DevToolsBlocker', 'AdBlockGuard', 'InitBlockGuard', 'AdminBrowserDisguise'];
        
        targetGates.forEach(gate => {
            if (!window[gate]) {
                Object.defineProperty(window, gate, {
                    get: function() { return dummyComponent; },
                    set: function() { },
                    configurable: false
                });
            }
        });
    };

    // 무한 디버거 타이밍 공격 차단
    const OriginalConstructor = Function.prototype.constructor;
    Function.prototype.constructor = function(...args) {
        if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('debugger')) {
            return function() {};
        }
        return OriginalConstructor.apply(this, args);
    };

    bypassEngine();
    document.addEventListener('DOMContentLoaded', bypassEngine);
    window.addEventListener('load', bypassEngine);
})();
