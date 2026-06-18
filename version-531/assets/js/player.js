export function initPlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var loaded = false;
  var hlsInstance = null;

  if (!video || !overlay || !options.url) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.url;
    } else if (options.Hls && options.Hls.isSupported()) {
      hlsInstance = new options.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(options.url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = options.url;
    }

    loaded = true;
  }

  function hideOverlay() {
    overlay.classList.add('is-hidden');
  }

  function showOverlay() {
    if (video.paused && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  }

  function play() {
    attach();
    hideOverlay();

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('ended', showOverlay);

  window.addEventListener('pagehide', function () {
    if (hlsInstance && typeof hlsInstance.destroy === 'function') {
      hlsInstance.destroy();
    }
  });
}
