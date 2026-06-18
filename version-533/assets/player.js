function initVideoPlayer(videoId, coverId, url) {
  const video = document.getElementById(videoId);
  const cover = document.getElementById(coverId);
  let attached = false;

  if (!video || !cover || !url) {
    return;
  }

  const attach = function () {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = url;
    attached = true;
  };

  const play = function () {
    attach();
    cover.classList.add('is-hidden');
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        cover.classList.remove('is-hidden');
      });
    }
  };

  cover.addEventListener('click', play);

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });
}
