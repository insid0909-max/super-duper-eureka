// ==UserScript==
// @name         Universal Webtoon Optimizer & Auto Resume
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  이미지 로딩 최적화 및 마지막 읽은 위치 기억 (이어보기)
// @match        *://newtoki*/*
// @match        *://manatoki*/*
// @match        *://booktoki*/*
// @match        *://copytoon*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    if (!/newtoki|manatoki|booktoki|copytoon/.test(location.hostname)) return;

    // 저장 키 생성 (웹툰 주소별로 고유 키 생성)
    const SAVE_KEY = `uwt_scroll_${location.pathname}`;

    const isValidSite = () =>
        !!(
            document.querySelector('.view-wrap')       ||
            document.querySelector('#toon-content')    ||
            document.querySelector('.webtoon-img-wrap')
        );

    // --- [추가] 스크롤 위치 저장 함수 ---
    const saveScrollPosition = () => {
        if (window.scrollY > 0) {
            localStorage.setItem(SAVE_KEY, window.scrollY);
        }
    };

    // --- [추가] 스크롤 위치 복구 함수 ---
    const restoreScrollPosition = () => {
        const savedPos = localStorage.getItem(SAVE_KEY);
        if (savedPos) {
            // 이미지 로딩 시간을 고려하여 약간의 지연 후 이동 (혹은 즉시 이동)
            window.scrollTo({ top: parseInt(savedPos), behavior: 'instant' });
            console.log(`[UWT] 복구된 위치: ${savedPos}px`);
        }
    };

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
                min-height: 200px; /* 로딩 전 높이 확보 */
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    };

    const resolveLazySrc = (img) => {
        const lazySrc = img.dataset.src || img.dataset.lazy || img.dataset.original || img.dataset.imgSrc || null;
        if (!lazySrc) return false;
        const rawSrc = img.getAttribute('src');
        if (!rawSrc || rawSrc !== lazySrc) img.src = lazySrc;
        return true;
    };

    const optimizeImg = (img) => {
        if (!img || img.dataset.optimized) return;
        const resolved = resolveLazySrc(img);
        if (!resolved && !img.getAttribute('src') && !img.currentSrc) return;
        img.loading = 'eager';
        img.decoding = 'async';
        img.classList.add('uwt-img');
        img.dataset.optimized = 'true';
    };

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

    const observerOptions = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-src', 'data-lazy', 'data-original', 'data-img-src'],
    };

    const connectObserver = () => {
        if (document.body) observer.observe(document.body, observerOptions);
    };

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

        // --- [추가] 초기화 시 스크롤 복구 실행 ---
        // 이미지가 어느 정도 그려진 후 이동하기 위해 약간의 지연을 줍니다.
        setTimeout(restoreScrollPosition, 500);

        // --- [추가] 스크롤 이벤트 리스너 (저장) ---
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(saveScrollPosition, 500); // 0.5초 멈췄을 때 저장
        }, { passive: true });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveScrollPosition(); // 탭을 전환하거나 앱을 내릴 때 즉시 저장
                observer.disconnect();
            } else {
                connectObserver();
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
