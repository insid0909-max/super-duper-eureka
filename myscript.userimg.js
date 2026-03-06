// ==UserScript==
// @name         Webtoon Image Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  웹툰 및 이미지 사이트 로딩 최적화 (Lazy Load & Async Decoding)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const optimizeImage = (img) => {
        if (!img.src || img.dataset.optimized) return;

        // 비동기 디코딩 및 지연 로딩 강제 적용
        img.decoding = 'async';
        img.loading = 'lazy';

        // 레이아웃 시프트 방지
        if (!img.style.minHeight) {
            img.style.minHeight = '100px';
        }

        img.dataset.optimized = 'true';
    };

    const runOptimization = () => {
        document.querySelectorAll('img').forEach(optimizeImage);
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IMG') optimizeImage(node);
                else if (node.querySelectorAll) node.querySelectorAll('img').forEach(optimizeImage);
            });
        });
    });

    runOptimization();
    observer.observe(document.body, { childList: true, subtree: true });
})();
