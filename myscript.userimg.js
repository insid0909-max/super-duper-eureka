// ==UserScript==
// @name         Universal Optimizer (Ultra Smooth Fix)
// @version      4.8
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.bobaedream.co.kr/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        videoRatio: "16 / 9",
        // 보배드림 전용 플레이어 컨테이너 추가
        videoSelectors: 'video, .video-js, .vjs-tech, iframe[src*="youtube"], .video-container, .vjs-poster, div[id*="video"], .k-video-container'
    };

    // [1단계] 눈에 보이는 튐을 방지하는 초고속 스타일 주입
    const style = document.createElement('style');
    style.textContent = `
        /* 영상이 나타날 자리를 미리 검은색 16:9 박스로 고정 */
        ${CONFIG.videoSelectors} {
            aspect-ratio: ${CONFIG.videoRatio} !important;
            width: 100% !important;
            height: auto !important;
            min-height: 220px !important; /* 모바일 평균 높이 확보 */
            background-color: #000 !important;
            display: block !important;
            overflow: hidden !important;
        }
        
        /* 보배드림 플레이어 하위 요소들이 튀어나오는 것 방지 */
        .video-js vjs-tech, .video-js .vjs-poster {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
        }
    `;
    document.documentElement.appendChild(style);

    // [2단계] 이미지 최적화 (기존 로직 유지)
    class ImageManager {
        constructor() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.dataset.src || img.dataset.file || img.getAttribute('data-original');
                        if (src && img.src !== src) img.src = src;
                    }
                });
            }, { rootMargin: '100% 0px' });
        }
        observe(el) { this.observer.observe(el); }
    }
    const manager = new ImageManager();

    // [3단계] 동적 감시 및 즉각 교정
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                
                // 동영상 요소 발견 시 즉시 비율 강제
                if (node.matches && node.matches(CONFIG.videoSelectors)) {
                    node.style.aspectRatio = CONFIG.videoRatio;
                }
                
                // 이미지 스캔
                if (node.tagName === 'IMG') manager.observe(node);
                node.querySelectorAll('img').forEach(img => manager.observe(img));
            });
        }
    });

    // 실행
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
