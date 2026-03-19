// ==UserScript==
// @name         Bobaedream Image Fix
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  보배드림 애니메이션 webp 레이아웃 튐 방지
// @match        *://*.bobaedream.co.kr/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ─── 1. 즉시 스타일 주입 ────────────────────────────────────────────
    const injectStyle = () => {
        if (document.getElementById('boba-style')) return;
        const style = document.createElement('style');
        style.id = 'boba-style';
        style.textContent = `
            img.boba-img {
                display: block !important;
                max-width: 100% !important;
                height: auto !important;
                min-height: 1px !important;
                contain: layout !important;
            }
        `;
        document.documentElement.appendChild(style);
    };
    injectStyle();

    // ─── 2. 이미지 처리 ─────────────────────────────────────────────────
    const optimizeImg = (img) => {
        if (!img || img.dataset.bobaFixed) return;
        if (!img.getAttribute('src')) return;
        img.classList.add('boba-img');
        img.dataset.bobaFixed = 'true'; // uwt와 다른 플래그명으로 충돌 방지
    };

    // ─── 3. MutationObserver ────────────────────────────────────────────
    const pendingNodes = new Set();
    let debounceTimer = null;

    const processNodes = () => {
        debounceTimer = null;
        const nodes = [...pendingNodes];
        pendingNodes.clear();
        for (const node of nodes) {
            if (node.tagName === 'IMG') {
                optimizeImg(node);
            } else {
                for (const img of node.getElementsByTagName('img')) {
                    optimizeImg(img);
                }
            }
        }
    };

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) pendingNodes.add(node);
            }
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(processNodes, 100);
    });

    // ─── 4. 초기화 ──────────────────────────────────────────────────────
    let initialized = false;

    const init = () => {
        if (initialized || !document.body) return;
        initialized = true;

        for (const img of document.getElementsByTagName('img')) {
            optimizeImg(img);
        }

        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('visibilitychange', () => {
            document.hidden
                ? observer.disconnect()
                : observer.observe(document.body, { childList: true, subtree: true });
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
