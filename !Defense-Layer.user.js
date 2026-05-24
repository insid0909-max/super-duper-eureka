// ==UserScript==
// @name         !0_Defense_Layer_Advanced
// @version      3.0.0
// @description  환경 고정, 정보 유출 방어, 스크립트 존재 은폐 및 패턴 난독화 준비
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 주요 객체 봉인 및 변조 방지[span_3](start_span)[span_3](end_span)
    const protectedObjects = ['navigator', 'screen', 'window'];
    protectedObjects.forEach(obj => {
        if (window[obj]) Object.freeze(window[obj]);
    });

    // 2. 후킹 방어를 위한 네이티브 함수 복구 및 은폐[span_4](start_span)[span_4](end_span)
    const maskNative = (funcName) => {
        const original = window[funcName];
        window[funcName] = new Proxy(original, {
            get(target, prop) {
                if (prop === 'toString') return () => `function ${funcName}() { [native code] }`;
                return Reflect.get(target, prop);
            }
        });
    };
    maskNative('fetch');
    maskNative('XMLHttpRequest');

    // 3. 사용자 식별 정보 조작 (핑거프린팅 방어)[span_5](start_span)[span_5](end_span)
    const fakeData = { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" };
    window.navigator = new Proxy(navigator, {
        get(target, prop) {
            return fakeData[prop] || Reflect.get(target, prop);
        }
    });

    // 4. 스크립트 은폐 (DOM 탐색 방어)[span_6](start_span)[span_6](end_span)
    const hideScript = () => {
        const scripts = document.querySelectorAll('script');
        scripts.forEach(s => {
            if (s.src && s.src.includes('antiadblck')) s.remove();
        });
    };
    const observer = new MutationObserver(hideScript);
    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
