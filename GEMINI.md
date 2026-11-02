# 📻 MBC 표준FM LIVE (Australia Edition) 프로젝트 요약

## 📋 프로젝트 개요
- **목적**: 호주에서 모바일(아이폰/안드로이드)로 한국 MBC 표준FM을 끊김 없이 청취할 수 있는 전용 웹 앱 구축.
- **주요 사용자**: 호주 거주 한국어 사용자 (아이폰 Safari 환경 최적화 PWA, 모바일 셀룰러 데이터 환경 특화).
- **호스팅**: GitHub Pages (`https://[유저아이디].github.io/my-radio`).

## 🛠️ 적용된 기술적 해결책 (v2.0.0 호주 모바일 딥 버퍼 & 멀티 CDN 엔진 탑재)
1. **타임시프트 딥 윈도우 확장기 (Time-Shift Deep Playlist Expander — 15초 한계 돌파)**:
   - MBC 공식 `chunklist.m3u8`은 기본 5개 세그먼트(약 15초)만 노출하여 일반 플레이어로는 12초 이상의 선행 버퍼링이 물리적으로 불가능했던 한계를 해결.
   - MBC 스트리밍 서버(`minisw` / `minisa` / `minisp`)가 실제로는 과거 50개 이상(약 150초)의 `media_XXXXX.aac` 세그먼트를 보관하고 있음을 실측 검증하여, 플레이리스트 수신 시 과거 38개 세그먼트(약 114초)를 동적으로 복원·결합해 총 43개 세그먼트(약 129초) 윈도우로 확장.
   - 재생 즉시 65~90초 분량의 실제 오디오 버퍼를 수 초 내에 메모리에 고속 충전하여, 호주 모바일 음영 지역(터널, 엘리베이터, 기지국 핸드오버)에서 60초 이상 통신이 끊겨도 무중단 재생 보장.
2. **공식 MBC 3중 멀티 CDN 무중단 페일오버 (`minisw` ↔ `minisa` ↔ `minisp`)**:
   - 작동 불능이었던 구형 외부 백업 URL을 제거하고, 동일한 `_lsu_sa_` 토큰과 동일한 시퀀스 번호(`media_XXXXX.aac`)를 공유하는 MBC 공식 3대 GSCDN 클러스터(`minisw.imbc.com`, `minisa.imbc.com`, `minisp.imbc.com`)를 커스텀 로더에 통합.
   - 특정 CDN 노드가 호주 국제망에서 지연되거나 타임아웃될 때 재생을 멈추지 않고 세그먼트 단위로 즉시 다른 CDN 클러스터에서 우회 다운로드.
3. **iPhone iOS `ManagedMediaSource` 셀룰러 조기 버퍼 차단 방어 & 백그라운드 워커 타이머**:
   - iOS Safari의 `ManagedMediaSource`가 셀룰러 환경에서 10~15초만 버퍼링되어도 `endstreaming` 이벤트로 `hls.pauseBuffering()`을 호출해 버퍼링을 멈추던 현상을 오버라이드로 완벽 차단(목표 버퍼 도달 전까지 다운로드 강제 유지).
   - `onstalled` 이벤트 발생 시 `audio.currentTime`을 강제 점프시켜 오디오가 툭툭 끊기던 치명적 버그 제거 및 미세 타임스탬프 홀(Micro-Gap) 자동 브릿징 적용.
   - 화면 잠금(백그라운드) 시 메인 스레드 타이머 쓰로틀링에 대비해 Web Worker 하드웨어 타이머와 `audio.ontimeupdate` 클럭으로 백그라운드 로더를 지속 구동.
4. **공식 실시간 편성표 API 연동 (JSONP)**:
   - `https://miniapi.imbc.com/Schedule/schedulelist?channel=sfm`을 JSONP로 호출하여 한국 시간(KST) 기준 현재 방송 중인 프로그램명, 방송 시간, 다음 프로그램 예고, 공식 고화질 앨범 아트(포스터)를 실시간 반영.
   - 1분 주기로 KST 시간을 모니터링하여 방송이 바뀔 때 자동으로 프로그램명과 앨범 커버 전환.
5. **미려하고 모던한 미니멀 오디오 디자인 (Anti-AI Aesthetic)**:
   - Braun / Teenage Engineering / Apple Music 감성의 프리미엄 오프블랙 테크웨어 디자인 적용.
   - 현재 방송 프로그램의 고화질 앨범 아트와 연동된 **동적 앰비언트 글로우(Ambient Blur Backdrop)** 구현.
   - 정밀 하드웨어 감성의 **버퍼 게이지 바(Buffer Reserve Monitor)** 및 실시간 모바일 네트워크 상태 배지 탑재.
6. **원클릭 즉각 복구 & iOS MediaSession 완벽 지원**:
   - 실시간 프로그램명과 고화질 앨범 커버를 아이폰 잠금 화면, 제어 센터, 에어팟/블루투스 기기에 실시간 동기화.

## 📂 파일 구성
- `index.html`: 모든 로직과 스타일이 통합된 메인 파일 (v2.0.0 호주 모바일 딥 버퍼 & 멀티 CDN 엔진 반영).
- `README.md`: GitHub 배포 및 사용 가이드, 아이폰 홈화면 설치(PWA) 가이드 포함.
- `manifest.json`: PWA 설정을 위한 메타데이터 (고화질 로컬 아이콘 등록).
- `apple-touch-icon.png`, `icon-512.png`, `icon-192.png`, `favicon.svg`: 고해상도 프리미엄 다크 테크웨어 PWA 전용 아이콘 자산.

## 💡 다음에 이어서 작업할 때 (프롬프트 예시)
"이전에 작업하던 **MBC 라디오 프로젝트** 이어서 진행해줘."
"UI에 **새로운 기능**을 추가하고 싶어."
"다른 **지역 방송 채널**도 추가해줘."

---
*Last updated: 2026-11-02 (v2.0.0 Time-Shift Deep Buffer & 3-Way Multi-CDN Failover Engine)*
