import React, { createContext, useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [activeTrack, setActiveTrack] = useState(null);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playModeIndex, setPlayModeIndex] = useState(0); // 0: ALL, 1: ONE, 2: SHUFFLE
  const [currentTheme, setCurrentTheme] = useState(null);

  const player = useAudioPlayer(activeTrack?.uri);
  const status = useAudioPlayerStatus(player);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (status) {
      setIsPlaying(status.playing);
      if (status.didJustFinish) {
        handleTrackFinished();
      }
    }
  }, [status?.playing, status?.didJustFinish]);

  useEffect(() => {
    if (player && activeTrack) {
      try {
        player.play();
        if (typeof player.setActiveForLockScreen === 'function') {
          player.setActiveForLockScreen(true, {
            title: activeTrack.filename?.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '') || activeTrack.name,
            artist: 'TressBit Engine',
          });
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }, [player, activeTrack]);

  const playTrack = (track, queue = [], theme = null) => {
    setActiveTrack(track);
    if (queue && queue.length > 0) setCurrentQueue(queue);
    else setCurrentQueue([track]);
    if (theme) setCurrentTheme(theme);
  };

  const togglePlayPause = () => {
    if (!player) return;
    try {
      if (isPlaying) player.pause();
      else player.play();
    } catch (e) {
      console.warn(e);
    }
  };

  const getCurrentIndex = () => {
    if (!currentQueue || currentQueue.length === 0 || !activeTrack) return -1;
    return currentQueue.findIndex((t) => (t.id && t.id === activeTrack.id) || t.uri === activeTrack.uri);
  };

  const playNext = () => {
    if (currentQueue.length <= 1) {
      player?.seekTo(0);
      return;
    }
    const idx = getCurrentIndex();
    if (playModeIndex === 2) {
      // SHUFFLE
      let rand = Math.floor(Math.random() * currentQueue.length);
      setActiveTrack(currentQueue[rand]);
      return;
    }
    const nextIdx = (idx + 1) % currentQueue.length;
    setActiveTrack(currentQueue[nextIdx]);
  };

  const playPrevious = () => {
    if ((status?.currentTime || 0) > 3) {
      player?.seekTo(0);
      return;
    }
    if (currentQueue.length <= 1) {
      player?.seekTo(0);
      return;
    }
    const idx = getCurrentIndex();
    const prevIdx = idx <= 0 ? currentQueue.length - 1 : idx - 1;
    setActiveTrack(currentQueue[prevIdx]);
  };

  const handleTrackFinished = () => {
    if (playModeIndex === 1) {
      player?.seekTo(0);
      player?.play();
    } else {
      playNext();
    }
  };

  const seekTo = (seconds) => {
    try {
      player?.seekTo(seconds);
    } catch (e) {
      console.warn(e);
    }
  };

  const togglePlayMode = () => {
    setPlayModeIndex((prev) => (prev + 1) % 3);
  };

  return (
    <AudioContext.Provider
      value={{
        activeTrack,
        currentQueue,
        isPlaying,
        status,
        currentTheme,
        setCurrentTheme,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        playModeIndex,
        togglePlayMode,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};