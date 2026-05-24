class Sbxh2 {
    constructor() {
        this.name = "짭토끼 전용 소스";
        this.baseUrl = "https://sbxh2.com";
        this.lang = "ko";
    }

    /**
     * [1] 인기/랭킹 목록 파싱
     * 앱 메인 화면에 만화 목록을 뿌려주는 함수입니다.
     */
    async getPopularManga(page) {
        const url = `${this.baseUrl}/?page=${page}`;
        const response = await http.get(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", "Referer": this.baseUrl }
        });
        const html = response.body;
        const mangaList = [];

        // Next.js 정적 데이터 스트림에서 타이틀과 고유 ID 구조 추출
        // 예: ["노예일지", "/comic/123", "thumb.jpg"] 형태를 매칭하는 정규식
        const listRegex = /"title":"([^"]+)","url":"([^"]+)","thumbnail":"([^"]+)"/g;
        let match;

        while ((match = listRegex.exec(html)) !== null) {
            mangaList.push({
                title: match[1],
                url: match[2], // 예: /comic/123
                thumbnail: match[3].replace(/\\/g, '') // 이스케이프 문자 제거
            });
        }

        return {
            manga: mangaList,
            hasNextPage: mangaList.length > 0
        };
    }

    /**
     * [2] 에피소드 회차 목록 파싱
     * 특정 만화를 눌렀을 때 1화, 2화... 회차 리스트를 가져옵니다.
     */
    async getMangaDetails(mangaUrl) {
        const response = await http.get(this.baseUrl + mangaUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36", "Referer": this.baseUrl }
        });
        const html = response.body;
        const chapters = [];

        // 회차 리스트 추출용 정규식 (사이트 뷰어 주소 구조 정밀 매칭)
        const chapterRegex = /"chapterName":"([^"]+)","viewerUrl":"([^"]+)"/g;
        let match;

        while ((match = chapterRegex.exec(html)) !== null) {
            chapters.push({
                name: match[1], // 예: 66화
                url: match[2]   // 예: /viewer/456
            });
        }

        // 최신화가 위로 오도록 정렬 (필요시 반전)
        return { chapters: chapters.reverse() };
    }

    /**
     * [3] 🎯 핵심: 뷰어 이미지 주소 정밀 추출
     * 안티 애드블록 감지기를 무력화하고 오직 원본 만화 이미지컷 주소만 필터링합니다.
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

        // 1단계: Next.js 하이드레이션 패킷 데이터 영역 분리
        const nextDataMatch = html.match(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/);
        
        if (nextDataMatch) {
            const dataStream = nextDataMatch[1];
            
            // 2단계: 이미지 확장자(.jpg, .webp 등) 주소 정밀 정규식 가동
            const imgRegex = /https:\/\/[^"'\s\\]+\.(jpg|jpeg|png|webp|gif)/gi;
            const foundImages = dataStream.match(imgRegex) || [];

            foundImages.forEach((img, index) => {
                const cleanImgUrl = img.replace(/\\/g, ''); // 슬래시 이스케이프 제거

                // 3단계: 가짜 광고 트랩 이미지(ad_test 등) 및 중복 주소 원천 차단
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

        return pages; // 정화된 이미지 주소 배열이 앱 내부 뷰어로 바로 전달됨
    }
}

// 앱 확장 시스템이 클래스를 인식하도록 내보내기
export default Sbxh2;
