export function video() {
	// Load the IFrame Player API code asynchronously.
	var tag = document.createElement('script');

	tag.src = "https://www.youtube.com/player_api";

	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	var player;

	function onYouTubePlayerAPIReady() {
	  player = new YT.Player('ytplayer', {
			height: '360',

			width: '640',

			videoId: '_N4WL5P9yEw',

			playerVars: {
				autoplay: 1,
				controls: 1,
				disablekb: 1,
				hl: 'ru-ru',
				loop: 1,
				modestbranding: 1,
				showinfo: 0,
				autohide: 1,
				color: 'white',
				iv_load_policy: 3,
				theme: 'light',
				rel: 0
			},

			events: {
				'onReady': onPlayerReady,
			}
		});
		onYouTubePlayerAPIReady();
	}

	function onPlayerReady(event){
		player.mute();
	}

	var tag = document.createElement('script');

	tag.src = 'https://www.youtube.com/iframe_api';

	var firstScriptTag = document.getElementsByTagName('script')[0];

	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	var player;

	function onYouTubeIframeAPIReady() {
		player = new YT.Player('playeryt', {
			events: {
				onReady: onPlayerReady,
			},
		});
	}

	function onPlayerReady() {
		player.playVideo();

		player.mute();
	}
}
