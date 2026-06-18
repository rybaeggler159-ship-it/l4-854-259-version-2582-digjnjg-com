import { H as Hls } from './hls.js';

const playerBoxes = document.querySelectorAll('[data-player-box]');

playerBoxes.forEach((box) => {
    const video = box.querySelector('video[data-hls-src]');
    const button = box.querySelector('[data-play-button]');
    const message = box.querySelector('[data-player-message]');
    let hlsInstance = null;
    let initialized = false;

    if (!video || !button) {
        return;
    }

    const showMessage = (text) => {
        if (!message) {
            return;
        }

        message.textContent = text;
        message.hidden = false;
    };

    const initializePlayer = () => {
        if (initialized) {
            video.play().catch(() => {
                showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
            });
            return;
        }

        initialized = true;
        button.classList.add('is-hidden');

        const source = video.dataset.hlsSrc;

        if (!source) {
            showMessage('当前影片暂未绑定播放源。');
            return;
        }

        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {
                    showMessage('播放器已准备好，请点击视频开始播放。');
                });
            });

            hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                if (!data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }

                if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }

                showMessage('播放源加载失败，请刷新页面后重试。');
                hlsInstance.destroy();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(() => {
                    showMessage('播放器已准备好，请点击视频开始播放。');
                });
            }, { once: true });
        } else {
            showMessage('当前浏览器不支持 HLS 播放，请更换支持的浏览器。');
        }
    };

    button.addEventListener('click', initializePlayer);

    window.addEventListener('pagehide', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
});
