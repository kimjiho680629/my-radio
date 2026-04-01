document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio');
    audio.preload = 'auto'; // 적극적 사전 로딩 설정

    const playBtn = document.getElementById('play-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const msg = document.getElementById('msg');
    const visualizer = document.getElementById('visualizer');
    const debug = document.getElementById('debug');
    const rateVal = document.getElementById('rate-val');
    const totalVal = document.getElementById('total-val');
    const stEl = document.getElementById('st');
    const ktEl = document.getElementById('kt');
    const retryBtn = document.getElementById('retry-btn');

    // 시계 업데이트
    function updateClocks() {
        const now = new Date();
        const opt = { hour: '2-digit', minute: '2-digit', hour12: false };
        stEl.innerText = now.toLocaleTimeString('en-AU', { ...opt, timeZone: 'Australia/Sydney' });
        ktEl.innerText = now.toLocaleTimeString('ko-KR', { ...opt, timeZone: 'Asia/Seoul' });
    }
    setInterval(updateClocks, 1000);
    updateClocks();

    // 스트리밍 소스 (해외 접속 최적화 순위)
    const SOURCES = [
        'https://mini-sfm.akamaized.net/sfm/sfm/playlist.m3u8', // 1. Akamai CDN (Global)
        'https://minimw.imbc.com/dsfm/_definst_/sfm.stream/playlist.m3u8', // 2. 본사 HLS (mini용)
        'https://sfm-hls.imbc.com/sfm/sfm.stream/playlist.m3u8', // 3. 본사 HLS (기본)
        'https://stream.bsmbc.com/live/mp4:BusanMBC-LiveStream-AM/playlist.m3u8', // 4. 부산MBC
        'https://5ddfd163bd00d.streamlock.net/STDFM/STDFM/playlist.m3u8' // 5. 울산MBC
    ];

    let idx = 0;
    let isPlaying = false;
    let totalBytes = 0;
    let lastTrackTime = 0;
    let stallTimer = null;
    let lastCurrentTime = -1;
    let bufferTimeout = null;

    function trackData() {
        if (!isPlaying || audio.paused) {
            rateVal.innerText = "0";
            lastTrackTime = 0;
            return;
        }
        const now = Date.now();
        if (lastTrackTime > 0) {
            const delta = (now - lastTrackTime) / 1000;
            const kbps = 128; // MBC 표준FM 비트레이트
            const added = (kbps * 1024 / 8) * delta;
            totalBytes += added;
            rateVal.innerText = kbps;
            totalVal.innerText = (totalBytes / (1024 * 1024)).toFixed(2);
        }
        lastTrackTime = now;

        // 스톨 감지 (재생 중인데 시간이 멈춘 경우)
        if (audio.currentTime === lastCurrentTime && !audio.paused) {
            if (!stallTimer) {
                stallTimer = setTimeout(() => {
                    console.log("Stall detected, recovering...");
                    debug.innerText = "Stall detected, recovering...";
                    start(); // 현재 채널 재시도
                }, 5000); // 5초간 멈추면 재연결
            }
        } else {
            clearTimeout(stallTimer);
            stallTimer = null;
        }
        lastCurrentTime = audio.currentTime;
    }
    setInterval(trackData, 1000);

    async function start() {
        clearTimeout(bufferTimeout);
        msg.innerText = `연결 중 (채널 ${idx + 1}/${SOURCES.length})...`;
        msg.style.color = "var(--text-sub)";
        
        try {
            const url = SOURCES[idx];
            debug.innerText = `Connecting: ${new URL(url).hostname}`;
            
            // 초기 접속 시에는 CDN 캐시를 활용하여 응답 속도 극대화
            // (에러가 나서 재시도하는 경우에만 타임스탬프를 붙여 신선한 매니페스트 강제)
            const cacheBuster = idx > 0 ? `?t=${Date.now()}` : '';
            audio.src = `${url}${cacheBuster}`;
            audio.load();
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                await playPromise;
                isPlaying = true;
                document.body.classList.add('is-playing');
                visualizer.classList.add('playing');
                msg.innerText = "● 실시간 방송 중";
                msg.style.color = "#34c759";
                retryBtn.style.display = "none";
            }
        } catch (e) {
            console.error('Playback failed:', e);
            next();
        }
    }

    function next() {
        clearTimeout(bufferTimeout);
        idx++;
        if (idx < SOURCES.length) {
            msg.innerText = `채널 전환 중 (${idx + 1}/${SOURCES.length})...`;
            // 대기 시간을 200ms로 단축하여 빠른 복구
            setTimeout(start, 200);
        } else {
            idx = 0;
            msg.innerText = "모든 경로 실패. 수동 새로고침 하세요.";
            msg.style.color = "#ff3b30";
            retryBtn.style.display = "inline-block";
        }
    }

    playBtn.onclick = () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            document.body.classList.remove('is-playing');
            visualizer.classList.remove('playing');
            msg.innerText = "일시 정지됨";
            msg.style.color = "var(--text-sub)";
            clearTimeout(bufferTimeout);
        } else {
            start();
        }
    };

    volumeSlider.oninput = (e) => {
        audio.volume = e.target.value;
    };

    // 자동 복구 및 상태 모니터링 강화
    audio.oncanplay = () => {
        if(isPlaying) {
            msg.innerText = "● 실시간 방송 중";
            msg.style.color = "#34c759";
            clearTimeout(bufferTimeout);
        }
    };

    audio.onwaiting = () => { 
        if(isPlaying) {
            msg.innerText = "버퍼링 중..."; 
            // 5초 이상 버퍼링 시 다음 채널로 전환 (속도 중시)
            clearTimeout(bufferTimeout);
            bufferTimeout = setTimeout(() => {
                debug.innerText = "Buffering too long, switching...";
                next();
            }, 5000);
        }
    };

    audio.onplaying = () => { 
        if(isPlaying) {
            msg.innerText = "● 실시간 방송 중"; 
            clearTimeout(bufferTimeout);
        }
    };

    audio.onstalled = () => {
        if(isPlaying) {
            debug.innerText = "Network stalled, retrying...";
            start();
        }
    };

    audio.onerror = () => { 
        if(isPlaying) { 
            debug.innerText = "Stream error, trying next..."; 
            next(); 
        } 
    };

    // 가시성 변경 시 자동 재생 유지 (iOS 대응)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isPlaying && audio.paused) {
            audio.play().catch(start);
        }
    });

    retryBtn.onclick = () => {
        idx = 0;
        start();
    };
});
