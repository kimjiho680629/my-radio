# 📻 MBC 표준FM LIVE (Australia Edition) 프로젝트 요약

## 📋 프로젝트 개요
- **목적**: 호주에서 모바일(아이폰/안드로이드)로 한국 MBC 표준FM을 끊김 없이 청취할 수 있는 전용 웹 앱 구축.
- **주요 사용자**: 호주 거주 한국어 사용자 (아이폰 Safari 환경 최적화 PWA).
- **호스팅**: GitHub Pages (`https://[유저아이디].github.io/my-radio`).

## 🛠️ 적용된 기술적 해결책 (v1.6.0 모던 리디자인 & 공식 편성표 연동 완료)
1. **공식 실시간 편성표 API 연동 (JSONP)**:
   - `https://miniapi.imbc.com/Schedule/schedulelist?channel=sfm`을 JSONP로 호출하여 한국 시간(KST) 기준 현재 방송 중인 프로그램명, 방송 시간, 다음 프로그램 예고, 공식 고화질 앨범 아트(포스터)를 실시간 반영.
   - 1분 주기로 KST 시간을 모니터링하여 방송이 바뀔 때 자동으로 프로그램명과 앨범 커버 전환.
2. **미려하고 모던한 미니멀 오디오 디자인 (Anti-AI Aesthetic)**:
   - 전형적인 AI 느낌의 네온 그라디언트를 완전히 걷어내고, Braun / Teenage Engineering / Apple Music 감성의 프리미엄 오프블랙 테크웨어 디자인 적용.
   - 현재 방송 프로그램의 고화질 앨범 아트와 연동된 **동적 앰비언트 글로우(Ambient Blur Backdrop)** 구현.
   - 슬림하고 정밀한 하드웨어 감성의 **버퍼 게이지 바(Buffer Reserve Monitor)** 및 햅틱 감성 컨트롤 버튼.
3. **초특급 선행 버퍼링 (Extreme Buffering & 60s Delay)**:
   - 라이브 최신 지점보다 **60초 과거 지점**에서 재생을 시작하여 전방 60~180초 대용량 사전 버퍼를 상시 확보.
   - iOS Safari 네이티브: `preload="auto"` 및 60초 안전 마진 지점으로 이동하여 백그라운드 선행 다운로드 강제.
   - HLS.js: `liveSyncDurationCount: 18`, 최대 7분(420s) 버퍼 및 50MB 메모리 할당.
4. **원클릭 즉각 복구 (Smart Play Trigger)**:
   - 방송이 끊겼거나 버퍼링에 걸렸을 때 재생(Play) 버튼을 누르면 정지되지 않고 **즉시 최신 스트림 세션을 재발급받아 강제 재연결 및 즉각 재생**.
5. **iOS(아이폰) 백그라운드 & MediaSession 완벽 지원**:
   - 실시간 프로그램명과 고화질 앨범 커버를 아이폰 잠금 화면, 제어 센터, 에어팟/블루투스 기기에 실시간 동기화.
   - 화면이 꺼지거나 다른 앱 사용 시에도 끊김 없이 백그라운드 재생 유지.

## 📂 파일 구성
- `index.html`: 모든 로직과 스타일이 통합된 메인 파일 (v1.6.0 반영).
- `README.md`: GitHub 배포 및 사용 가이드, 아이폰 홈화면 설치(PWA) 가이드 포함.
- `manifest.json`: PWA 설정을 위한 메타데이터.

## 💡 다음에 이어서 작업할 때 (프롬프트 예시)
"이전에 작업하던 **MBC 라디오 프로젝트** 이어서 진행해줘."
"UI에 **새로운 기능**을 추가하고 싶어."
"다른 **지역 방송 채널**도 추가해줘."

---
*Last updated: 2026-10-31 (Live Schedule Integration & Modern Audio Redesign)*
