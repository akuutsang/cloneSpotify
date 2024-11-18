import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function Player({ accessToken, trackUri }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => initializePlayer();
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      const spotifyPlayer = new window.Spotify.Player({
        name: "Web Playback SDK Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
      });

      spotifyPlayer.addListener("player_state_changed", (state) => {
        setIsPlaying(state ? !state.paused : false);
      });

      spotifyPlayer.connect();
    }

    return () => {
      if (player) player.disconnect();
    };
  }, [accessToken]);

  useEffect(() => {
    if (deviceId && trackUri) {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ uris: [trackUri] }),
      }).catch(console.error);
    }
  }, [deviceId, trackUri, accessToken]);

  return (
    <div>
      <button onClick={() => player && player.togglePlay()}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}

Player.propTypes = {
  accessToken: PropTypes.string.isRequired,
  trackUri: PropTypes.string,
};
