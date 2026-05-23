// ==UserScript==
// @name         Anti-DevTools-Blocker Killer (Universal)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  도메인 변경 대응 - 무한 디버거 및 포맷터 감지 영구 무력화
// @author       
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. (function(){}).constructor("debugger")() 우회
    const FunctionPrototypeConstructor = Function.prototype.constructor;
    Function.prototype.constructor = function(...args) {
        if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('debugger')) {
            // 디버거 유발 코드가 감지되면 빈 함수를 반환해 무력화
            return function() {};
        }
        return FunctionPrototypeConstructor.apply(this, args);
    };

    // 2. devtoolsFormatters를 이용한 콘솔 감지 방어
    Object.defineProperty(window, 'devtoolsFormatters', {
        get: function() { return []; },
        set: function(val) { /* 사이트가 감지용 포맷터를 심으려고 하면 무시 */ },
        configurable: false
    });

    // 3. 우클릭 및 단축키 해제 (캡처 및 이벤트 가로채기 방지)
    window.addEventListener('keydown', function(e) { e.stopPropagation(); }, true);
    window.addEventListener('contextmenu', function(e) { e.stopPropagation(); }, true);
})();
