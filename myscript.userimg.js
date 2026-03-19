// ==UserScript==
// @name         Universal Webtoon Optimizer
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  뉴토끼, 마나토끼 등 유사 사이트 이미지 로딩 최적화
// @match        *://newtoki*/*
// @match        *://manatoki*/*
// @match        *://booktoki*/*
// @match        *://copytoon*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ─── 0. 호스트 1차 필터 ─────────────────────────────────────────────
    if (!/newtoki|manatoki|booktoki|copytoon/.test(location.hostname)) return;

    // ─── 1. 사이트 구조 2차 필터 ────────────────────────────────────────
    const isValidSite = () =>
        !!(
            document.querySelector('.view-wrap')       ||
            document.querySelector('#toon-content')    ||
            document.querySelector('.webtoon-img-wrap')
        );

    // ─── 2. 전역 스타일 주입 ────────────────────────────────────────────
    const injectStyle = () => {
        if (document.getElementById('uwt-style')) return;
        const style = document.createElement('style');
        style.id = 'uwt-style';
        style.textContent = `
            img.uwt-img {
                display: block !important;
                margin: 0 auto !important;
                max-width: 100% !important;
                height: auto !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    };

    // ─── 3. lazy src 교체 ───────────────────────────────────────────────
    const resolveLazySrc = (img) => {
        const lazySrc =
            img.dataset.src      ||
            img.dataset.lazy     ||
            img.dataset.original ||
            img.dataset.imgSrc   ||
            null;
        if (!lazySrc) return false;
        const rawSrc = img.getAttribute('src');
        if (!rawSrc || rawSrc !== lazySrc) img.src = lazySrc;
        return true;
    };

    // ─── 4. 이미지 최적화 ───────────────────────────────────────────────
    const optimizeImg = (img) => {
        if (!img || img.dataset.optimized) return;
        const resolved = resolveLazySrc(img);
        if (!resolved && !img.getAttribute('src') && !img.currentSrc) return;
        img.loading = 'eager';
        img.decoding = 'async';
        img.classList.add('uwt-img');
        img.dataset.optimized = 'true';
    };

    // ─── 5. MutationObserver ────────────────────────────────────────────
    const pendingNodes = new Set();
    let debounceTimer = null;
    let observer = null;

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

    const mutationCallback = (mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) pendingNodes.add(node);
                }
            }
            if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
                pendingNodes.add(mutation.target);
            }
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(processNodes, 100);
    };

    // ─── 6. 옵저버 연결/해제 ────────────────────────────────────────────
    const observerOptions = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-src', 'data-lazy', 'data-original', 'data-img-src'],
    };

    const connectObserver = () => {
        if (document.body) observer.observe(document.body, observerOptions);
    };

    // ─── 7. 초기화 ──────────────────────────────────────────────────────
    let initialized = false;

    const init = () => {
        if (initialized || !document.body || !isValidSite()) return;
        initialized = true;

        injectStyle();
        observer = new MutationObserver(mutationCallback);
        connectObserver();

        for (const img of document.getElementsByTagName('img')) {
            optimizeImg(img);
        }

        document.addEventListener('visibilitychange', () => {
            document.hidden ? observer.disconnect() : connectObserver();
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
