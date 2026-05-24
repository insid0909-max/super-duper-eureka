class Sbxh2 {
    constructor() {
        this.name = "짭토끼 전용 소스";
        this.baseUrl = "https://sbxh2.com";
        this.lang = "ko";
    }

    /**
     * [1] 인기/랭킹 목록 파싱
     */
    async getPopularManga(page) {
        const url = `${this.baseUrl}/?page=${page}`;
        const response = await http.get(url, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", 
                "Referer": this.baseUrl 
            }
        });
        const html = response.body;
        const mangaList = [];

        // 무한 루프 방지를 위해 matchAll 스타일로 안전하게 처리
        const listRegex = /"title":"([^"]+)","url":"([^"]+)","thumbnail":"([^"]+)"/g;
        const matches = html.matchAll(listRegex);

        for (const match of matches) {
            mangaList.push({
                title: match[1],
                url: match[2],
                thumbnail: match[3].replace(/\\/g, '') // 이스케이프 주소 정화
            });
        }

        return {
            manga: mangaList,
            hasNextPage: mangaList.length > 0
        };
    }

    /**
     * [2] 에피소드 회차 목록 파싱
     */
    async getMangaDetails(mangaUrl) {
        const response = await http.get(this.baseUrl + mangaUrl, {
            headers: { 
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", 
                "Referer": this.baseUrl 
            }
        });
        const html = response.body;
        const chapters = [];

        const chapterRegex = /"chapterName":"([^"]+)","viewerUrl":"([^"]+)"/g;
        const matches = html.matchAll(chapterRegex);

        for (const match of matches) {
            chapters.push({
                name: match[1],
                url: match[2]
            });
        }

        return { chapters: chapters.reverse() }; // 최신화 상단 정렬
    }

    /**
     * [3] 🎯 뷰어 이미지 주소 정밀 추출 (Next.js 가로채기)
     */
    async getPageList(chapterUrl) {
        const response = await http.get(this.baseUrl + chapterUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
                "Referer": this.baseUrl + chapterUrl
            }
        });
        const html = response.body;
        const pages = [];

        // 1단계: Next.js 데이터 청크 추출
        const nextDataMatch = html.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/);
        
        if (nextDataMatch) {
            const dataStream = nextDataMatch[1];
            
            // 2단계: 이미지 확장자 검사 기만 차단 규칙
            const imgRegex = /https:\/\/[^"'\s\\]+\.(jpg|jpeg|png|webp|gif)/gi;
            const foundImages = dataStream.match(imgRegex) || [];

            foundImages.forEach((img) => {
                const cleanImgUrl = img.replace(/\\/g, '');

                // 트랩 데이터(ad_test, pixel) 원천 배제
                if (!cleanImgUrl.includes('ad_test') && 
                    !cleanImgUrl.includes('pixel') && 
                    !pages.some(p => p.url === cleanImgUrl)) {
                    
                    pages.push({
                        index: pages.length,
                        url: cleanImgUrl
                    });
                }
            });
        }

        return pages;
    }
}

// [교정] 모듈 내보내기 신택스 에러 해결
// 앱 런타임 환경 엔진이 클래스 인스턴스를 정상적으로 바인딩하도록 처리
function Ext() {
    return new Sbxh2();
}
