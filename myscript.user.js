// ==UserScript==
// @name         Google SafeSearch Disabler
// @namespace    https://www.google.com/
// @version      1.0
// @description  구글 세이프서치(성인 콘텐츠 필터)를 자동으로 해제합니다
// @author       Custom
// @match        https://www.google.com/*
// @match        https://www.google.co.kr/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // URL에서 세이프서치 파라미터 제거/변경
  function disableSafeSearch() {
    const url = new URL(location.href);

    // safe=active 또는 safe=strict → safe=off 로 변경
    if (url.searchParams.get('safe') !== 'off') {
      url.searchParams.set('safe', 'off');
      // 히스토리 변경 (페이지 리로드 없이)
      history.replaceState(null, '', url.toString());
    }
  }

  // 검색 폼 submit 시 safe=off 강제 삽입
  function patchSearchForms() {
    document.querySelectorAll('form').forEach((form) => {
      if (form.dataset.safePatched) return;
      form.dataset.safePatched = 'true';

      form.addEventListener('submit', () => {
        let safeInput = form.querySelector('input[name="safe"]');
        if (!safeInput) {
          safeInput = document.createElement('input');
          safeInput.type = 'hidden';
          safeInput.name = 'safe';
          form.appendChild(safeInput);
        }
        safeInput.value = 'off';
      });
    });
  }

  // 링크에 safe=off 파라미터 추가
  function patchLinks() {
    document.querySelectorAll('a[href*="google"]').forEach((a) => {
      try {
        const url = new URL(a.href);
        if (url.searchParams.has('q')) {
          url.searchParams.set('safe', 'off');
          a.href = url.toString();
        }
      } catch (_) {}
    });
  }

  // 초기 실행
  disableSafeSearch();

  // DOM 로드 후 실행
  document.addEventListener('DOMContentLoaded', () => {
    patchSearchForms();
    patchLinks();
  });

  // 동적으로 추가되는 요소 감시 (SPA 대응)
  const observer = new MutationObserver(() => {
    patchSearchForms();
    patchLinks();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // pushState / replaceState 후에도 URL 파라미터 유지
  const _pushState = history.pushState.bind(history);
  const _replaceState = history.replaceState.bind(history);

  history.pushState = function (state, title, url) {
    if (url) {
      try {
        const u = new URL(url, location.origin);
        if (u.searchParams.has('q')) u.searchParams.set('safe', 'off');
        url = u.toString();
      } catch (_) {}
    }
    return _pushState(state, title, url);
  };

  history.replaceState = function (state, title, url) {
    if (url) {
      try {
        const u = new URL(url, location.origin);
        if (u.searchParams.has('q')) u.searchParams.set('safe', 'off');
        url = u.toString();
      } catch (_) {}
    }
    return _replaceState(state, title, url);
  };
})();
