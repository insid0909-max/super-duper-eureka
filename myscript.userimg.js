// ==UserScript==
// @name         Universal Webtoon Optimizer & Auto Resume (Samsung Only)
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  삼성 인터넷 앱에서만 이미지 최적화 및 이어보기 작동
// @match        *://newtoki*/*
// @match        *://manatoki*/*
// @match        *://booktoki*/*
// @match        *://copytoon*/*
// @exclude      *://gemini.google.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ─── 0. 브라우저 및 호스트 필터 ──────────────────────────────────────
    // 삼성 인터넷 브라우저가 아니면 즉시 종료
    const isSamsungBrowser = /SamsungBrowser/i.test(navigator.userAgent);
    if (!isSamsungBrowser) {
        console.log("[UWT] 삼성 인터넷이 아니므로 스크립트를 실행하지 않습니다.");
        return;
    }

    // 대상 사이트가 아니면 종료
    if (!/newtoki|manatoki|booktoki|copytoon/.test(location.hostname)) return;

    // ─── 이후 기존 로직 동일 ───────────────────────────────────────────
    const PREFIX = 'uwt_scroll_';
    const SAVE_KEY = `${PREFIX}${location.pathname}`;
    const MAX_HISTORY = 300;

    const isValidSite = () =>
        !!(
            document.querySelector('.view-wrap')       ||
            document.querySelector('#toon-content')    ||
            document.querySelector('.webtoon-img-wrap')
        );

    // [이하 생략 - 이전 버전의 모든 로직 포함]
    // ... (saveScrollPosition, restoreScrollPosition, optimizeImg 등 그대로 유지) ...
