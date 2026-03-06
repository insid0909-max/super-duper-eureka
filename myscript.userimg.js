// ==UserScript==
// @name         Universal Webtoon Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  뉴토끼, 마나토끼 등 유사 사이트 이미지 로딩 및 메모리 최적화
// @match        *://newtoki*/*
// @match        *://manatoki*/*
// @match        *://booktoki*/*
// @match        *://copytoon*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 1. 이미지 최적화 핵심 설정
    const optimizeImg = (img) => {
        if (!img.src || img.dataset.optimized) return;

        // 비동기 디코딩 강제 (스크롤 버벅임 방지)
        img.decoding = 'async';
        
        // 브라우저 네이티브 지연 로딩 활성화
        img.loading = 'lazy';

        // 레이아웃 흔들림 방지 및 스타일 최적화
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        img.dataset.optimized = 'true';
    };

    // 2. 동적 로딩(무한 스크롤) 감시
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IMG') {
                    optimizeImg(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(optimizeImg);
                }
            });
        });
    });

    // 3. 실행 로직
    const init = () => {
        document.querySelectorAll('img').forEach(optimizeImg);
        observer.observe(document.body, { childList: true, subtree: true });
    };

    // DOM 로드 완료 전후 모두 대응
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
