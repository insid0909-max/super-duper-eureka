// ==UserScript==
// @name         Universal Optimizer (Ironclad Video Fix)
// @version      5.0
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.bobaedream.co.kr/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. 최우선 순위 스타일 주입 (브라우저 엔진보다 빠르게)
    const style = document.createElement('style');
    style.textContent = `
        /* 영상 관련 모든 요소를 16:9 영역 안에 가둡니다 */
        video, .video-js, .vjs-tech, .video-container, .k-video-container, div[id*="video_player"] {
            aspect-ratio: 16 / 9 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 180px !important; /* 초기 0px 방지 */
            max-height: 75vh !important;
            object-fit: contain !important;
            background-color: #000 !important;
        }
        /* 보배드림 전용: 내부 컨테이너의 강제 높이값 해제 */
        .k-video-container div, .video-js div {
            height: auto !important;
        }
    `;
    document.documentElement.appendChild(style);

    // 2. 자바스크립트 강제 고정 (보배드림 스크립트 무력화)
    const lockVideoSize = (el) => {
        if (!el || el.dataset.sizeLocked) return;
        
        // 사이트 스크립트가 height를 px로 바꿀 수 없게 'auto'로 박제
        Object.defineProperty(el.style, 'height', {
            value: 'auto',
            writable: false, // 수정 불가능하게 잠금
            configurable: true
        });
        el.dataset.sizeLocked = "true";
    };

    // 3. 이미지 매니저 (기존 웹툰 최적화 로직 유지)
    const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src || img.dataset.file || img.getAttribute('data-original');
                if (src && img.src !== src) img.src = src;
            }
        });
    }, { rootMargin: '100% 0px' });

    // 4. 통합 감시 엔진
    const mainObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType !== 1) return;
                
                // 동영상 요소 발견 시 크기 잠금 실행
                if (node.matches && node.matches('video, .video-js, .k-video-container')) {
                    lockVideoSize(node);
                }
                
                // 이미지 최적화
                if (node.tagName === 'IMG') imgObserver.observe(node);
                node.querySelectorAll('img').forEach(img => imgObserver.observe(img));
                node.querySelectorAll('video, .video-js').forEach(v => lockVideoSize(v));
            });
        }
    });

    if (document.body) {
        mainObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            mainObserver.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
