// ==UserScript==
// @name         Universal Webtoon & Video Optimizer (Integrated)
// @version      4.0
// @description  VRAM 최적화 + 동영상 레이아웃 튐 방지 (보배드림 대응)
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.booktoki*/*
// @match        *://*.copytoon*/*
// @match        *://*.bobaedream.co.kr/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PRO_CONFIG = {
        threshold: 1.5, 
        vramReclaim: true,
        videoRatio: "16 / 9",
        selectors: ['.view-wrap img', '#toon-content img', '.webtoon-img-wrap img', 'img[data-src]'],
        videoSelectors: 'video, .video-js, .vjs-tech, iframe[src*="youtube"], .video-container, .vjs-poster'
    };

    // 1. 메모리 및 이미지 관리자
    class ImageManager {
        constructor() {
            this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
                rootMargin: `${window.innerHeight * PRO_CONFIG.threshold}px 0px`
            });
        }

        handleIntersect(entries) {
            entries.forEach(entry => {
                const img = entry.target;
                if (entry.isIntersecting) {
                    this.load(img);
                } else if (PRO_CONFIG.vramReclaim) {
                    this.unload(img);
                }
            });
        }

        load(img) {
            const realSrc = img.dataset.src || img.dataset.file || img.getAttribute('data-original');
            if (realSrc && img.src !== realSrc) {
                img.src = realSrc;
                img.style.opacity = "1";
                img.dataset.loaded = "true";
            }
        }

        unload(img) {
            if (img.dataset.loaded === "true" && img.getBoundingClientRect().top > window.innerHeight * 3) {
                // 필요시 img.src = ''; 로 VRAM 강제 해제 가능
            }
        }

        observe(el) {
            this.observer.observe(el);
        }
    }

    const manager = new ImageManager();

    // 2. 동영상 레이아웃 강제 고정 함수
    const fixVideoLayout = (root) => {
        const targets = root.querySelectorAll ? root.querySelectorAll(PRO_CONFIG.videoSelectors) : [];
        targets.forEach(el => {
            if (el.dataset.layoutFixed) return;
            el.style.setProperty('aspect-ratio', PRO_CONFIG.videoRatio, 'important');
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('height', 'auto', 'important');
            el.style.setProperty('max-height', '85vh', 'important');
            el.dataset.layoutFixed = "true";
        });
    };

    // 3. 고성능 스캔 (TreeWalker)
    const scanAndObserve = (root) => {
        if (!root || root.nodeType !== 1) return;
        
        // 동영상 체크
        fixVideoLayout(root);

        // 이미지 체크
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode: (node) => node.tagName === 'IMG' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        });

        let node;
        while(node = walker.nextNode()) {
            manager.observe(node);
        }
    };

    // 4. 실행 엔진 (MutationObserver)
    const engine = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) scanAndObserve(node);
            });
        }
    });

    const init = () => {
        // 공통 스타일 주입 (Reflow 최적화 + Layout Shift 방지)
        const style = document.createElement('style');
        style.textContent = `
            img { transition: opacity 0.3s; will-change: transform; }
            img:not([src]) { opacity: 0; }
            
            /* 동영상 크기 튐 방지 핵심 CSS */
            ${PRO_CONFIG.videoSelectors} {
                aspect-ratio: ${PRO_CONFIG.videoRatio} !important;
                width: 100% !important;
                height: auto !important;
                max-width: 100% !important;
                object-fit: contain !important;
                background-color: #000 !important;
            }
        `;
        document.head.appendChild(style);

        scanAndObserve(document.body);
        engine.observe(document.body, { childList: true, subtree: true });
    };

    // 실행 시점 제어
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
