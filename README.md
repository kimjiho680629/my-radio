# 📻 MBC 표준FM LIVE (Australia Edition)

호주에서 아이폰으로 한국 MBC 표준FM을 끊김 없이 청취할 수 있도록 설계된 전용 웹 앱입니다. 호주-한국 간의 네트워크 특성을 고려하여 해외 접속에 최적화된 스트리밍 경로와 자동 복구 로직이 적용되어 있습니다.

## ✨ 주요 기능 및 최적화
- **초고속 접속 (Instant Connect)**:
    - `preconnect` 기술을 사용하여 스트리밍 서버(Akamai CDN 등)와 미리 연결을 형성합니다.
    - 초기 접속 시 CDN 엣지 캐시를 활용하여 호주 내 가장 가까운 서버에서 데이터를 즉시 가져옵니다.
- **4단계 자동 복구 (4-Layer Failover)**:
    - 1순위: Akamai 글로벌 CDN (해외 접속 최적화)
    - 2순위: iMBC 본사 HLS 직통 주소
    - 3순위: 부산/울산 MBC 백업 채널
    - 연결 끊김 시 200ms 내 즉각적인 채널 전환 시도.
- **지능형 모니터링 (Smart Monitoring)**:
    - **스톨(Stall) 감지**: 재생 중 소리가 멈추면 5초 내로 자동 재연결합니다.
    - **실시간 데이터 표시**: 현재 전송 속도(kbps)와 누적 사용량(MB)을 실시간으로 확인 가능합니다.
- **아이폰(iOS) 전용 UI/UX**:
    - Apple Music 스타일의 **글래스모피즘(Glassmorphism)** 다크 테마.
    - 조작 편의성을 위해 버튼과 폰트 크기를 대폭 확대.
    - 시드니(SYD)와 서울(SEL) 시간을 동시에 보여주는 **듀얼 시계**.
    - PWA(Progressive Web App) 지원: 홈 화면 추가 시 전체 화면 앱 모드 지원.

## 🚀 사용 방법
1. **아이폰 Safari** 브라우저에서 이 페이지에 접속합니다.
2. 하단 중앙의 **[공유 버튼(사각형에 화살표)]**을 누릅니다.
3. 메뉴에서 **[홈 화면에 추가]**를 선택합니다.
4. 바탕화면의 **MBC 라디오** 아이콘을 터치하여 실행합니다.

## 🛠️ 기술적 특징
- **No JS Framework**: 순수 Vanilla JS로 제작되어 가볍고 빠릅니다.
- **Adaptive Bitrate**: MBC 표준FM 128kbps 고음질 스트리밍 지원.
- **iOS Background Play**: Safari의 `playsinline` 속성 적용으로 백그라운드 재생 및 화면 꺼짐 대응.

---
*Last Updated: 2026-04-01 (Connection Speed & Buffering Optimization)*
*Optimized for iOS & Australia Edge Networks.*
