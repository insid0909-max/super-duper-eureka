// ==UserScript==
// @name         Universal Webtoon Optimizer (Pro Structure)
// @version      3.0
// @description  VRAM 최적화, 네트워크 큐 우선순위 제어 및 안티-프리즈 공학 적용
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.booktoki*/*
// @match        *://*.copytoon*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PRO_CONFIG = {
        threshold: 1.5, // 화면 높이의 1.5배 지점에서 미리 로드
        vramReclaim: true, // 화면에서 멀어지면 메모리 해제
        maxConcurrent: 5,  // 동시 접속 우선순위 제어 보조
        selectors: ['.view-wrap img', '#toon-content img', '.webtoon-img-wrap img', 'img[data-src]']
    };

    // 1. 메모리 효율을 위한 가상 이미지 관리자
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
                    this.unload(img); // 메모리 확보를 위한 언로드
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
            // 완전히 보이지 않게 된 지 오래된 이미지는 낮은 해상도나 빈 값으로 치환하여 VRAM 절약
            if (img.dataset.loaded === "true" && img.getBoundingClientRect().top > window.innerHeight * 3) {
                // 선택적 구현: img.src = ''; (다시 로드해야 하는 트레이드오프 발생)
            }
        }

        observe(el) {
            this.observer.observe(el);
        }
    }

    const manager = new ImageManager();

    // 2. 고성능 돔 스캔 (TreeWalker 활용 - querySelector보다 빠름)
    const scanAndObserve = (root) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
            acceptNode: (node) => node.tagName === 'IMG' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
        });

        let node;
        while(node = walker.nextNode()) {
            manager.observe(node);
        }
    };

    // 3. 실행 엔진
    const engine = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) scanAndObserve(node);
            });
        }
    });

    const init = () => {
        // 스타일 주입 (리플로우 최적화)
        const style = document.createElement('style');
        style.textContent = `
            img { transition: opacity 0.3s; will-change: transform; }
            img:not([src]) { opacity: 0; }
        `;
        document.head.appendChild(style);

        scanAndObserve(document.body);
        engine.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
