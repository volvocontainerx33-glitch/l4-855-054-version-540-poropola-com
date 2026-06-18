(function () {
    function setupPlayer(wrapper) {
        var video = wrapper.querySelector('video[data-stream]');
        var button = wrapper.querySelector('.player-start');
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                wrapper.hlsInstance = hls;
            } else {
                video.src = stream;
            }
            attached = true;
        }

        function play() {
            attach();
            wrapper.classList.add('is-playing');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    wrapper.classList.remove('is-playing');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            wrapper.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                wrapper.classList.remove('is-playing');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
    });
})();
