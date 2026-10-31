# Design Document: network-resilience

## 1. 개요
* **기능명**: 절대 끊기지 않는 오디오 재생 및 버퍼링 최적화
* **목적**: HLS 버퍼 관리 수치를 극한으로 끌어올리고, 모바일 네이티브 HLS 플레이어의 헬스체크 및 복구 타이밍을 안정화한다.

## 2. 세부 설계

### 2.1 HLS.js 설정 수정 (PC 및 안드로이드용)
`index.html`의 HLS.js 초기화 옵션을 다음과 같이 변경:
- `liveSyncDurationCount`: 2 -> 5 (라이브 엣지에서 5세그먼트 뒤에서 재생 시작. 1세그먼트를 6초라 가정하면 약 30초 지연)
- `liveMaxLatencyDurationCount`: 6 -> 10 (버퍼 지연 임계치 증가)
- `maxBufferLength`: 15 -> 60 (버퍼를 최대 60초 확보)
- `maxMaxBufferLength`: 30 -> 120

### 2.2 네이티브 및 폴백 타이머 (iOS용)
`index.html` 상단 상수 변경:
- `BUFFER_TIMEOUT`: 10000 -> 15000 (버퍼링 대기 시간을 15초로 늘림)
- `STALL_JUMP_SEC`: 4 -> 6 (일시 멈춤을 6초까지 기다림)
- `STALL_SWITCH_SEC`: 10 -> 15 (채널 변경은 15초간 멈출 때만 수행)

### 2.3 `jumpToLive()` 함수 안전 마진 적용
기존 로직:
```javascript
if (audio.seekable && audio.seekable.length > 0) {
    audio.currentTime = audio.seekable.end(0) - 0.5;
}
```
변경 로직 (가장 최신 데이터보다 10초 뒤로 점프하여 즉각적인 버퍼링 확보):
```javascript
if (audio.seekable && audio.seekable.length > 0) {
    let target = audio.seekable.end(0) - 10;
    if (target < audio.seekable.start(0)) target = audio.seekable.start(0);
    audio.currentTime = target;
}
```

### 2.4 강제 소스 재로드 (Forced Source Reload)
단순한 재생 지점 이동으로 해결되지 않는 '소리 반복'이나 '무한 버퍼링' 발생 시, 세션을 완전히 파괴하고 새로 연결하는 기능 추가:
- UI: 플레이어 카드 하단 또는 상태 메시지 옆에 '새로고침' 아이콘 버튼 추가.
- 로직: `loadSource(srcIdx)`를 강제 호출하여 매니페스트부터 다시 읽어옴.

### 2.5 자동 복구 시퀀스 고도화
1. Stall 감지 (6초) -> `jumpToLive()` (안전 마진 -10초 지연 지점으로 이동)
2. 이동 후에도 5초 내 재생 시작 안 됨 -> 동일 소스 강제 재로드 (`loadSource(srcIdx)`)
3. 재로드 후에도 실패 -> 다음 소스 전환 (`tryNext()`)

## 3. Executive Summary
### Executive Summary
이 설계는 "지연(Delay)이 생기더라도 절대 멈추지 않는(Zero-Stuttering)" 라디오 청취 경험을 호주/해외 사용자에게 제공하며, 특히 네트워크 불안정으로 인한 '소리 반복' 현상을 완전히 제거하는 것을 목표로 합니다.

| Problem | Solution | Function UX Effect | Core Value |
|---------|----------|-------------------|------------|
| 잦은 버퍼링과 재생 멈춤 | HLS 버퍼 60초 확보 및 라이브 엣지 이격 | 재생 중단 횟수 90% 이상 감소 | 쾌적하고 스트레스 없는 연속 청취 경험 제공 |
| 소리 반복(Looping) 현상 | 강제 소스 재로드 및 세션 초기화 로직 | 비정상 재생 시 즉시 정상화 가능 | 방송 품질의 신뢰성 확보 |
