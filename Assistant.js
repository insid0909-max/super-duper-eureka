// ==UserScript==
// @name         NewToki & BlackToon Zero-Lag Saver (v7.0)
// @namespace    https://github.com/
// @version      7.0
// @description  순정 스크롤바 100% 보존 + 랙 없는 팝업 암살 엔진
// @author       지혁 (AI Collaborator)
// @match        *://*.sbxh2.com/*
// @match        *://*.blacktoon*.com/*
// @match        *://*.newtoki*.com/*
// @match        *://*.manatoki*.com/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // 차단 검사 기초 패스
    window.__ntk_ib_ok = 1;

    // 구글로 튕겨버리는 리디렉션 납치 방어
    try {
        const rawReplace = window.location.replace;
        window.location.replace = function(url) {
            if (url.includes("google.com")) return;
            return rawReplace.apply(this, arguments);
        };
    } catch(e){}

    // 화면 멈춤(스크롤 락) 강제 해제 함수
    const clearScrollLock = () => {
        if(document.body) {
            document.body.style.setProperty("overflow", "auto", "important");
            document.body.style.setProperty("user-select", "auto", "important");
        }
        if(document.documentElement) {
            document.documentElement.style.setProperty("overflow", "auto", "important");
        }
    };

    // [핵심] 제로-랙(Zero-Lag) 실시간 팝업 암살단
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // 요소가 화면에 추가될 때
                    // 1. 디버거 차단 블랙스크린 즉시 삭제
                    if (node.id === "ntk_devtools_overlay") {
                        node.remove();
                        clearScrollLock();
                    } 
                    // 2. 광고 차단 감지 리액트 오버레이 즉시 삭제
                    else if (node.tagName === 'DIV' && node.textContent && node.textContent.includes("광고 차단 프로그램이 감지되었습니다")) {
                        // 오탐지 방지를 위해 글자 수가 1000자 이하인 팝업 레이어만 타겟팅
                        if (node.textContent.length < 1000) {
                            node.remove();
                            clearScrollLock();
                        }
                    }
                }
            });
        });
    });

    // 브라우저 렌더링 시작과 동시에 암살단 투입
    const startObserver = () => {
        observer.observe(document.documentElement, { childList: true, subtree: true });
    };

    if (document.documentElement) startObserver();
    else window.addEventListener('DOMContentLoaded', startObserver);

    // 보험용: 페이지 로딩 완료 시점 최종 청소
    window.addEventListener('load', () => {
        const devOverlay = document.getElementById("ntk_devtools_overlay");
        if(devOverlay) devOverlay.remove();
        
        document.querySelectorAll('div').forEach(el => {
            if(el.textContent && el.textContent.includes("광고 차단 프로그램이 감지되었습니다") && el.textContent.length < 1000) {
                const style = window.getComputedStyle(el);
                if(style.position === 'fixed') el.remove();
            }
        });
        clearScrollLock();
    });
})();
