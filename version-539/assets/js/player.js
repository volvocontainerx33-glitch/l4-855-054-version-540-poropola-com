(function () {
  function isHlsSource(source) {
    return /\.m3u8(\?|#|$)/i.test(source || "");
  }

  function setMessage(player, message) {
    var messageNode = player.querySelector("[data-player-message]");

    if (messageNode) {
      messageNode.textContent = message || "";
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var source = player.getAttribute("data-src");
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function attachSource() {
      setMessage(player, "");

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (isHlsSource(source)) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                setMessage(player, "当前播放源暂时无法加载，请稍后重试。");
              }
            }
          });
        } else {
          setMessage(player, "当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器。");
          return;
        }
      } else {
        video.src = source;
      }

      video.controls = true;
      button.classList.add("is-hidden");

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setMessage(player, "浏览器阻止了自动播放，请再次点击视频播放按钮。");
        });
      }
    }

    button.addEventListener("click", attachSource);
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
