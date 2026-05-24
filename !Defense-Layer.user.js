// ==UserScript==
// @name         Defense Layer for Samsung Internet
// @version      1.0.0
// @description  사용자 정보 유출 및 API 후킹 방어
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 객체 잠금: 웹사이트가 브라우저의 기본 환경설정을 수정하지 못하게 함[span_3](start_span)[span_3](end_span)
    Object.freeze(navigator);
    Object.freeze(window.screen);

    // 2. 네이티브 함수 마스킹: 후킹 흔적 은폐[span_4](start_span)[span_4](end_span)
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
        if (this.name === 'fetch' || this.name === 'XMLHttpRequest') {
            return `function ${this.name}() { [native code] }`;
        }
        return originalToString.apply(this, arguments);
    };

    // 3. 역정보 주입 (Honeypot): 추적 스크립트가 잘못된 값을 가져가게 함[span_5](start_span)[span_5](end_span)
    const handler = {
        get(target, prop) {
            if (prop === 'userAgent') {
                return "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
            }
            return Reflect.get(target, prop);
        }
    };
    window.navigator = new Proxy(navigator, handler);

})();
