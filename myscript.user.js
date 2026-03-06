// ==UserScript==
// @name         이미지 보호 완전 해제 (Method 7-8 격파)
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  이미지 위 덮개(Overlay)를 제거하고 pointer-events를 강제 활성화합니다.
// @author       Gemini
// @match        *://*/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const breakImageProtection = () => {
        // 1. 모든 요소의 pointer-events를 강제로 활성화 (Method 8 격파)
        const style = document.createElement('style');
        style.innerHTML = `
            img, canvas, video {
                pointer-events: auto !important;
                -webkit-touch-callout: default !important;
                user-select: auto !important;
            }
            /* 이미지 위에 덧씌워진 투명 레이어(Overlay)를 클릭 무시하게 설정 */
            div:empty, span:empty {
                pointer-events: none !important;
            }
        `;
        document.documentElement.appendChild(style);

        // 2. 이미지 위에 겹쳐진(Overlap) 방해 요소 제거 (Method 7 격파)
        document.querySelectorAll('img').forEach(img => {
            img.oncontextmenu = null;
            
            // 이미지 주위의 z-index가 더 높은 투명 요소를 찾아 클릭 통과시키기
            let prev = img.previousElementSibling;
            let next = img.nextElementSibling;
            
            [prev, next].forEach(el => {
                if (el && (el.tagName === 'DIV' || el.tagName === 'SPAN')) {
                    const rect = el.getBoundingClientRect();
                    const imgRect = img.getBoundingClientRect();
                    // 위치가 겹치는지 확인
                    if (Math.abs(rect.top - imgRect.top) < 5 && Math.abs(rect.left - imgRect.left) < 5) {
                        el.style.pointerEvents = 'none'; // 클릭이 아래(이미지)로 통과함
                    }
                }
            });
        });
    };

    // 즉시 실행 및 페이지 변화 감지 시 재실행
    breakImageProtection();
    const observer = new MutationObserver(breakImageProtection);
    observer.observe(document.body, { childList: true, subtree: true });

    // 3. 우클릭 메뉴 강제 호출 (최후의 수단)
    window.addEventListener('contextmenu', (e) => {
        e.stopPropagation();
    }, true);
})();
