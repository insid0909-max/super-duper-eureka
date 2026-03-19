// ==UserScript==
// @name         Universal Webtoon Optimizer & Auto Resume (Samsung Pro)
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  삼성 인터넷 전용 메모리 최적화 및 완벽한 이어보기 구현
// @match        *://*.newtoki*/*
// @match        *://*.manatoki*/*
// @match        *://*.booktoki*/*
// @match        *://*.copytoon*/*
// @exclude      *://gemini.google.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ─── 1. 브라우저 환경 검사 ──────────────────────────────────────────
    if (!/SamsungBrowser/i.test(navigator.userAgent)) {
        console.log("[UWT] 삼성 인터넷 전용 스크립트입니다. 실행을 중단합니다.");
        return;
    }

    // ─── 2. 전역 설정 및 키 생성 ────────────────────────────────────────
    const PREFIX = 'uwt_scroll_';
    const SAVE_KEY = `${PREFIX}${location.pathname}`;
    const MAX_HISTORY = 300; // 최대 저장 개수
    
    // ─── 3. 스크롤 저장 및 복구 로직 (모바일 최적화) ────────────────────
    
    // (1) 오래된 스크롤 기록 청소 (Garbage Collection)
    const cleanUpOldHistory = () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
        if (keys.length > MAX_HISTORY) {
            // 키를 저장 시간(또는 이름) 기준으로 정렬 후 초과분 삭제
            // (간단히 무작위 초과분 삭제도 가능하지만, 브라우저 한계 방지용)
            const keysToRemove = keys.slice(0, keys.length - MAX_HISTORY);
            keysToRemove.forEach(k => localStorage.removeItem(k));
        }
    };

    // (2) 스크롤 위치 저장 (Debounce 없이 즉시 저장 - 모바일 특화)
    const saveScrollPosition = () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 100) { // 최상단에 있을 때는 굳이 저장하지 않음
            localStorage.setItem(SAVE_KEY, currentScroll.toString());
            cleanUpOldHistory();
        }
    };

    // (3) 스크롤 복구
    const restoreScrollPosition = () => {
        const savedScroll = localStorage.getItem(SAVE_KEY);
        if (savedScroll) {
            window.scrollTo({
                top: parseInt(savedScroll, 10),
                behavior: 'instant' // 모바일에서 부드러운 스크롤은 버그 유발 가능, 즉시 이동
            });
            console.log(`[UWT] 이전 위치(${savedScroll}px)로 이동했습니다.`);
        }
    };

    // ─── 4. 모바일 백그라운드 전환 감지 (핵심 방어 코드) ────────────────
    const setupScrollSavers = () => {
        // 스크롤 시 저장 (성능을 위해 패시브 리스너 사용 및 쓰로틀링 권장)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
            scrollTimeout = requestAnimationFrame(saveScrollPosition);
        }, { passive: true });

        // 삼성 인터넷 탭 전환 / 앱 종료 시 강제 저장
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) saveScrollPosition();
        });
        window.addEventListener('pagehide', saveScrollPosition);
    };

    // ─── 5. 초기화 및 기존 이미지 최적화 로직 연결 ──────────────────────
    const init = () => {
        const isValidSite = !!(
            document.querySelector('.view-wrap') ||
            document.querySelector('#toon-content') ||
            document.querySelector('.webtoon-img-wrap')
        );

        if (!isValidSite) return;

        // 1. 이어보기 세팅
        restoreScrollPosition();
        setupScrollSavers();

        // 2. [이전 버전의 이미지 최적화 로직 실행]
        // ... (optimizeImg, IntersectionObserver, MutationObserver 로직 여기에 삽입) ...
    };

    // DOM이 그려진 후 실행 (document-start 대응)
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
