// ==UserScript==
// @name         Universal Webtoon Optimizer
// @namespace    http://tampermonkey.net/
// @version      1.5
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

    // ─── 0. 호스트 기반 1차 필터 ────────────────────────────────────────
    const host = location.hostname;
    const isSupportedHost =
        /newtoki|manatoki|booktoki|copytoon/.test(host);

    if (!isSupportedHost) return;

    // ─── 1. 사이트 유효성 검사 (구조 기반 2차 필터) ────────────────────
    const isValidSite = () => {
        // 뷰어 고유 구조가 없으면 즉시 종료
        return (
            document.querySelector('.view-wrap') ||
            document.querySelector('#toon-content') ||
            document.querySelector('.webtoon-img-wrap')
        );
    };

    // ─── 2. 이미지 최적화 ───────────────────────────────────────────────
    const optimizeImg = (img) => {
        if (!img || img.dataset.optimized) return;
        if (!img.src && !img.dataset.src && !img.dataset.lazy && !img.currentSrc) {
            return;
        }

        // 모든 컷을 즉시 로딩 (초기 대역폭 증가 가능성 있음)
        img.loading = 'eager';
        img.decoding = 'async';

        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';

        img.dataset.optimized = 'true';
    };

    // ─── 3. MutationObserver (디바운스 적용) ──────────────────────────
    let debounceTimer = null;
    let observer = null;

    const processMutations = (mutations) => {
        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes;
            if (!added || !added.length) continue;

            for (let j = 0; j < added.length; j++) {
                const node = added[j];

                // 직접 IMG인 경우
                if (node.nodeType === 1 && node.tagName === 'IMG') {
                    optimizeImg(node);
                    continue;
                }

                // 하위에 IMG가 있는 컨테이너인 경우
                if (node.nodeType === 1) {
                    const imgs = node.getElementsByTagName('img');
                    for (let k = 0; k < imgs.length; k++) {
                        optimizeImg(imgs[k]);
                    }
                }
            }
        }
    };

    const mutationCallback = (mutations) => {
        if (!mutations || !mutations.length) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            processMutations(mutations);
        }, 100);
    };

    // ─── 4. 초기화 및 옵저버 관리 ─────────────────────────────────────
    const init = () => {
        if (!document.body) return;

        if (!isValidSite()) return;

        // 초기 로딩 시 이미 존재하는 IMG 최적화
        const initialImgs = document.getElementsByTagName('img');
        for (let i = 0; i < initialImgs.length; i++) {
            optimizeImg(initialImgs[i]);
        }

        observer = new MutationObserver(mutationCallback);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        // 탭 비활성화 시 옵저버 부담을 느끼면 아래처럼 추가도 가능
        // document.addEventListener('visibilitychange', () => {
        //     if (document.hidden) observer.disconnect();
        //     else observer.observe(document.body, { childList: true, subtree: true });
        // });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
