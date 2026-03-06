// ==UserScript==
// @name         Webtoon Image Optimizer (지혁 커스텀)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  웹툰 및 이미지 사이트 로딩 최적화 (Lazy Load & Async Decoding)
// @author       Gemini
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. 이미지 최적화 설정 함수
    const optimizeImage = (img) => {
        if (!img.src || img.dataset.optimized) return;

        // 비동기 디코딩 설정 (스크롤 버벅임 방지)
        img.decoding = 'async';

        // 브라우저 기본 Lazy Loading 활성화
        img.loading = 'lazy';

        // 레이아웃 흔들림 방지를 위한 최소 높이 확보 (선택 사항)
        if (!img.style.minHeight) {
            img.style.minHeight = '200px';
            img.style.backgroundColor = '#f0f0f0'; // 로딩 전 회색 박스
        }

        img.dataset.optimized = 'true';
    };

    // 2. 페이지 내 모든 이미지 스캔 및 적용
    const runOptimization = () => {
        const images = document.querySelectorAll('img');
        images.forEach(optimizeImage);
    };

    // 3. 동적으로 추가되는 이미지 감시 (무한 스크롤 대응)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IMG') {
                    optimizeImage(node);
                } else if (node.querySelectorAll) {
                    node.querySelectorAll('img').forEach(optimizeImage);
                }
            });
        });
    });

    // 초기 실행
    runOptimization();

    // 감시 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log("🚀 이미지 로딩 최적화 스크립트가 활성화되었습니다.");
})();
