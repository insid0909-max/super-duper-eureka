// ==UserScript==
// @name         !0_Defense_Layer_Integrated
// @version      2.0.0
// @description  환경 고정, 정보 유출 방어 및 스크립트 존재 은폐
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 객체 잠금: 사이트가 사용자 환경을 변조하지 못하도록 보호[span_2](start_span)[span_2](end_span)
    Object.freeze(navigator);
    Object.freeze(window.screen);

    // 2. 네이티브 함수 마스킹: 후킹 흔적을 은폐하여 사이트의 검사 무력화[span_3](start_span)[span_3](end_span)
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
        if (this.name === 'fetch' || this.name === 'XMLHttpRequest' || this.name === 'querySelector') {
            return `function ${this.name}() { [native code] }`;
        }
        return originalToString.apply(this, arguments);
    };

    // 3. 역정보 주입 (Honeypot): 유출 시도 시 가짜 정보를 전달하여 추적 무력화[span_4](start_span)[span_4](end_span)
    const handler = {
        get(target, prop) {
            if (prop === 'userAgent') {
                return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
            }
            return Reflect.get(target, prop);
        }
    };
    window.navigator = new Proxy(navigator, handler);

    // 4. 스크립트 존재 은폐: 사이트 측이 설치된 스크립트를 탐색하지 못하게 함[span_5](start_span)[span_5](end_span)
    const originalQuery = document.querySelector;
    document.querySelector = function(selector) {
        if (selector && typeof selector === 'string' && selector.includes('antiadblck')) {
            return null; // 탐지 시도 시 스크립트가 없는 것처럼 처리[span_6](start_span)[span_6](end_span)
        }
        return originalQuery.apply(this, arguments);
    };

})();
