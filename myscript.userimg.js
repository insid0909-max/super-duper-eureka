// ==UserScript==
// @name         Universal Webtoon & Video Optimizer (Extreme Fix)
// @version      4.5
// @description  VRAM 최적화 + 동영상 레이아웃 튐 현상 완전 봉쇄
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.booktoki*/*
// @match        *://*.bobaedream.co.kr/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        videoRatio: "16 / 9",
        videoSelectors: 'video, .video-js, .vjs-tech, iframe[src*="youtube"], .video-container, .vjs-poster, div[id*="video"]'
    };

    // [핵심] 페이지 로딩 시작 즉시 스타일 주입 (가장 빠른 시점)
    const injectFlashFix = () => {
        const style = document.createElement('style');
        style.textContent = `
            ${CONFIG.videoSelectors} {
                aspect-ratio: ${CONFIG.videoRatio} !important;
                width: 100% !important;
                height: auto !important;
                min-height: 200px !important; /* 최소 높이 확보로 0->확대 현상 방지 */
                max-width: 100% !important;
                object-fit: contain !important;
                background-color: #000 !important;
            }
        `;
        document.documentElement.appendChild(style);
    };
    injectFlashFix();

    // 기존 이미지 매니저 클래스 (VRAM 최적화용)
    class ImageManager {
        constructor() {
            this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
                rootMargin: `150% 0px`
            });
        }
        handleIntersect(entries) {
            entries.forEach(entry => {
                const img = entry.target;
                if (entry.isIntersecting) {
                    const realSrc = img.dataset.src || img.dataset.file || img.getAttribute('data-original');
                    if (realSrc && img.src !== realSrc) img.src = realSrc;
                }
            });
        }
        observe(el) { this.observer.observe(el); }
    }
    const manager = new ImageManager();

    // 동적 요소 감시 엔진
    const engine = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    // 동영상 체크
                    if (node.matches && node.matches(CONFIG.videoSelectors)) {
                        node.style.aspectRatio = CONFIG.videoRatio;
                    }
                    // 이미지 체크
                    if (node.tagName === 'IMG') manager.observe(node);
                    const imgs = node.querySelectorAll('img');
                    imgs.forEach(img => manager.observe(img));
                }
            });
        }
    });

    const init = () => {
        engine.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
