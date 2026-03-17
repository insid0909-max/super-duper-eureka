// ==UserScript==
// @name         Universal Webtoon Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  뉴토끼, 마나토끼 등 유사 사이트 이미지 로딩 및 메모리 최적화
// @match        *://newtoki*/*
// @match        *://manatoki*/*
// @match        *://booktoki*/*
// @match        *://copytoon*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ─── 1. 사이트 유효성 검사 (와일드카드 오매칭 방어) ───────────────────
    // 뷰어 고유 구조가 없으면 즉시 종료
    const isValidSite = () =>
        document.querySelector('.view-wrap, #toon-content, .webtoon-img-wrap');

    // ─── 2. 이미지 최적화 ─────────────────────────────────────────────────
    const optimizeImg = (img) => {
        if (!img.src || img.dataset.optimized) return;

        // 뷰어 내부 이미지는 eager로 순차 로딩 보장
        // lazy는 다음 컷이 늦게 뜨는 버벅임 원인이 될 수 있음
        img.loading = 'eager';
        img.decoding = 'async';

        img.style.cssText = [
            'display:block',
            'margin:0 auto',
            'max-width:100%',
            'height:auto',
        ].join(';');

        img.dataset.optimized = 'true';
    };

    // ─── 3. MutationObserver (디바운스 적용) ──────────────────────────────
    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            mutations.forEach(({ addedNodes }) => {
                addedNodes.forEach((node) => {
                    if (node.tagName === 'IMG') {
                        optimizeImg(node);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('img').forEach(optimizeImg);
                    }
                });
            });
        }, 100);
    });

    // ─── 4. 초기화 ────────────────────────────────────────────────────────
    const init = () => {
        if (!document.body) return; // body null 방어

        // 와일드카드 오매칭 사이트 걸러내기
        if (!isValidSite()) return;

        document.querySelectorAll('img').forEach(optimizeImg);
        observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
