// ==UserScript==
// @name         Universal Webtoon Optimizer (Final)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  이미지 로딩 최적화, 메모리 절약 및 레이아웃 흔들림 방지
// @author       Gemini-Refined
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.booktoki*/*
// @match        *://*.copytoon*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ─── 1. 전역 설정 및 스타일 주입 ───────────────────────────────────
    const CONFIG = {
        lazyKeys: ['src', 'lazy', 'original', 'imgSrc', 'path', 'file', 'view'],
        rootMargin: '800px', // 화면 밖 800px 지점부터 미리 로딩 시작
        minHeight: '400px'   // 로딩 전 이미지 영역 확보 (레이아웃 튐 방지)
    };

    const injectGlobalStyle = () => {
        if (document.getElementById('webtoon-opt-style')) return;
        const style = document.createElement('style');
        style.id = 'webtoon-opt-style';
        style.textContent = `
            img[data-optimized="true"] {
                display: block !important;
                margin: 10px auto !important;
                max-width: 100% !important;
                height: auto !important;
                background-color: #1a1a1a; /* 로딩 전 배경색 */
                content-visibility: auto;  /* 브라우저 렌더링 최적화 */
            }
        `;
        document.head.appendChild(style);
    };

    // ─── 2. 이미지 최적화 핵심 로직 ──────────────────────────────────────
    const resolveAndOptimize = (img) => {
        if (img.dataset.optimized === 'true') return;

        // 적절한 원본 소스 찾기
        let targetSrc = null;
        for (const key of CONFIG.lazyKeys) {
            const val = img.dataset[key] || img.getAttribute('data-' + key);
            if (val) {
                targetSrc = val;
                break;
            }
        }

        if (targetSrc) {
            // 상대 경로 및 프로토콜 누락 대응
            if (targetSrc.startsWith('//')) targetSrc = location.protocol + targetSrc;
            
            img.src = targetSrc;
            img.loading = 'lazy';
            img.decoding = 'async';
            img.style.minHeight = CONFIG.minHeight;
            img.dataset.optimized = 'true';
        }
    };

    // ─── 3. Intersection Observer (가시성 기반 로딩) ──────────────────
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                resolveAndOptimize(entry.target);
                io.unobserve(entry.target); // 로딩 시작 후 관찰 해제
            }
        });
    }, { rootMargin: CONFIG.rootMargin });

    // ─── 4. Mutation Observer (동적 로딩 대응) ────────────────────────
    let rSample;
    const observer = new MutationObserver((mutations) => {
        if (rSample) cancelAnimationFrame(rSample);
        rSample = requestAnimationFrame(() => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType !== 1) continue;
                    if (node.tagName === 'IMG') {
                        io.observe(node);
                    } else {
                        node.querySelectorAll('img').forEach(img => io.observe(img));
                    }
                }
            }
        });
    });

    // ─── 5. 초기화 및 가시성 관리 ──────────────────────────────────────
    const init = () => {
        const isSupportedHost = /newtoki|manatoki|booktoki|copytoon/.test(location.hostname);
        if (!isSupportedHost) return;

        injectGlobalStyle();

        // 기존 이미지 관찰 시작
        document.querySelectorAll('img').forEach(img => io.observe(img));

        // 변화 감지 시작
        observer.observe(document.body, { childList: true, subtree: true });

        // 탭 비활성화 시 리소스 절약
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                observer.disconnect();
            } else {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
    };

    // 실행 시점 제어
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
