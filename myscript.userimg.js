// ==UserScript==
// @name         Universal Webtoon Optimizer & Auto Resume
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  이미지 로딩 최적화 + 마지막 읽은 위치 기억 (최대 300개 기록 유지)
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

    // --- 설정 값 ---
    const PREFIX = 'uwt_scroll_';
    const SAVE_KEY = `${PREFIX}${location.pathname}`;
    const MAX_HISTORY = 300; // 최대 저장 기록 개수

    const isValidSite = () =>
        !!(
            document.querySelector('.view-wrap')       ||
            document.querySelector('#toon-content')    ||
            document.querySelector('.webtoon-img-wrap')
        );

    // --- [통합] 스크롤 위치 저장 및 데이터 관리 ---
    const saveScrollPosition = () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 0) {
            // 현재 위치와 시간 저장
            const data = {
                pos: currentScroll,
                time: Date.now()
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            cleanOldHistory();
        }
    };

    // 오래된 기록 삭제 (MAX_HISTORY 기준)
    const cleanOldHistory = () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
        if (keys.length > MAX_HISTORY) {
            const history = keys.map(k => ({ key: k, time: JSON.parse(localStorage.getItem(k)).time || 0 }));
            // 시간순 정렬 후 가장 오래된 것 삭제
            history.sort((a, b) => a.time - b.time);
            localStorage.removeItem(history[0].key);
        }
    };

    // --- [통합] 스크롤 위치 복구 ---
    const restoreScrollPosition = () => {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (savedData) {
            try {
                const { pos } = JSON.parse(savedData);
                if (pos) {
                    window.scrollTo({ top: parseInt(pos), behavior: 'instant' });
                    console.log(`[UWT] 복구 완료: ${pos}px`);
                }
            } catch (e) {
                localStorage.removeItem(SAVE_KEY);
            }
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
                min-height: 500px; /* 복구 정확도를 위해 최소 높이 확보 */
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

    const connectObserver = () => {
        if (document.body) observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-src', 'data-lazy', 'data-original', 'data-img-src'],
        });
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

        // --- 초기 접속 시 위치 복구 ---
        // 웹툰 이미지가 어느 정도 불러와진 뒤 이동해야 정확합니다.
        setTimeout(restoreScrollPosition, 600);

        // --- 이벤트 리스너: 스크롤 멈출 때 저장 ---
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(saveScrollPosition, 800); 
        }, { passive: true });

        // --- 이벤트 리스너: 앱 종료/탭 전환 시 저장 ---
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                saveScrollPosition();
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
