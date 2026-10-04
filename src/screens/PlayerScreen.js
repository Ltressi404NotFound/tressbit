import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FavoritesContext } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');
const PLAY_MODES = ['ALL', 'ONE', 'SHUFFLE'];

export default function PlayerScreen({
  track,
  playlist = [],
  onBack,
  onTrackChange,
}) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const favorite = isFavorite(track?.id, track?.uri);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playModeIndex, setPlayModeIndex] = useState(0); // 0: ALL, 1: ONE, 2: SHUFFLE
  const [volume, setVolume] = useState(1.0);

  const playMode = PLAY_MODES[playModeIndex];

  // Retrouver l'index courant dans la file d'attente
  const getCurrentIndex = () => {
    if (!playlist || playlist.length === 0 || !track) return -1;
    return playlist.findIndex((t) => {
      if (track.id && t.id && track.id === t.id) return true;
      if (track.uri && t.uri && track.uri === t.uri) return true;
      if (track.filename && t.filename && track.filename === t.filename) return true;
      return false;
    });
  };

  useEffect(() => {
    const idx = getCurrentIndex();
    if (idx !== -1) setCurrentTrackIndex(idx);
  }, [track, playlist]);

  // Initialisation du lecteur natif
  const player = useAudioPlayer(track?.uri);
  const status = useAudioPlayerStatus(player);
  const [isPlaying, setIsPlaying] = useState(false);

  // Synchronisation du statut
  useEffect(() => {
    if (status) {
      setIsPlaying(status.playing);
      if (status.didJustFinish) {
        handleTrackFinished();
      }
    }
  }, [status?.playing, status?.didJustFinish]);

  // Démarrage de lecture et déclaration du Media Notification / Lockscreen
  useEffect(() => {
    if (player) {
      try {
        player.volume = volume;
        player.play();

        const trackTitle = track?.filename
          ? track.filename.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '')
          : track?.name || 'TressBit Music';

        // Déclaration du service de notification natif Android / LockScreen
        if (typeof player.setActiveForLockScreen === 'function') {
          player.setActiveForLockScreen(true, {
            title: trackTitle,
            artist: 'TressBit Audio Engine',
          });
        }
      } catch (e) {
        console.warn('Erreur lecture/lockscreen:', e);
      }
    }
  }, [player, track]);

  const togglePlayPause = () => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    } catch (e) {
      console.warn('Action lecture impossible:', e);
    }
  };

  // Calcul du temps et conversion ms -> s si nécessaire
  const currentSeconds = Math.max(0, Math.floor(Number(status?.currentTime) || 0));
  const rawDuration = status?.duration || track?.duration || 0;
  const totalSeconds = Math.max(
    1,
    rawDuration > 10000 ? Math.floor(rawDuration / 1000) : Math.floor(rawDuration || 1)
  );

  const progressPercent = Math.min(Math.max((currentSeconds / totalSeconds) * 100, 0), 100);

  // Déplacement direct au toucher sur la barre de progression
  const handleSeekProgress = (event) => {
    if (!player || totalSeconds <= 0) return;
    try {
      const { locationX } = event.nativeEvent;
      const barWidth = width - 80;
      const ratio = Math.max(0, Math.min(1, locationX / barWidth));
      const targetSeconds = Math.floor(ratio * totalSeconds);

      player.seekTo(targetSeconds);
    } catch (e) {
      console.warn('Erreur seekTo:', e);
    }
  };

  // Avance rapide (+10s)
  const forward10 = () => {
    if (!player) return;
    try {
      const target = Math.min(totalSeconds, currentSeconds + 10);
      player.seekTo(target);
    } catch (e) {
      console.warn(e);
    }
  };

  // Retour rapide (-10s)
  const rewind10 = () => {
    if (!player) return;
    try {
      const target = Math.max(0, currentSeconds - 10);
      player.seekTo(target);
    } catch (e) {
      console.warn(e);
    }
  };

  // Passer au morceau suivant
  const playNextTrack = () => {
    if (!playlist || playlist.length <= 1) {
      player?.seekTo(0);
      return;
    }

    const currentIndex = getCurrentIndex();

    if (playMode === 'SHUFFLE') {
      let randomIndex = Math.floor(Math.random() * playlist.length);
      if (randomIndex === currentIndex && playlist.length > 1) {
        randomIndex = (randomIndex + 1) % playlist.length;
      }
      const nextSong = playlist[randomIndex];
      if (onTrackChange) onTrackChange(nextSong);
      return;
    }

    // Mode ALL séquentiel
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % playlist.length;
    const nextSong = playlist[nextIndex];
    if (onTrackChange) onTrackChange(nextSong);
  };

  // Revenir au morceau précédent
  const playPreviousTrack = () => {
    if (currentSeconds > 3) {
      player?.seekTo(0);
      return;
    }

    if (!playlist || playlist.length <= 1) {
      player?.seekTo(0);
      return;
    }

    const currentIndex = getCurrentIndex();
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    const prevSong = playlist[prevIndex];
    if (onTrackChange) onTrackChange(prevSong);
  };

  // Enchaînement automatique à la fin du son
  const handleTrackFinished = () => {
    if (playMode === 'ONE') {
      player?.seekTo(0);
      player?.play();
    } else {
      playNextTrack();
    }
  };

  const togglePlayMode = () => {
    setPlayModeIndex((prev) => (prev + 1) % PLAY_MODES.length);
  };

  // Volume tactile
  const handleVolumeChange = (event) => {
    const { locationX } = event.nativeEvent;
    const barWidth = width - 110;
    const newVol = Math.max(0, Math.min(1, locationX / barWidth));
    setVolume(newVol);
    try {
      if (player) player.volume = newVol;
    } catch (e) {
      console.warn(e);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.backdrop}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeContainer}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
            <Ionicons name="chevron-down" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.nowPlayingBadge}>EN COURS DE LECTURE</Text>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Player Card */}
        <View style={styles.playerCardContainer}>
          <LinearGradient
            colors={['#1F2124', '#0F1012', '#0A0B0C']}
            style={styles.playerCard}
          >
            {/* Pochette sonore */}
            <View style={styles.artworkContainer}>
              <LinearGradient
                colors={['#2D3238', '#151719']}
                style={styles.artworkPlaceholder}
              >
                <Ionicons name="musical-notes" size={72} color="#00FF66" />
              </LinearGradient>
            </View>

            {/* Titre & Favori */}
            <View style={styles.titleRow}>
              <View style={styles.titleTextWrapper}>
                <Text numberOfLines={1} style={styles.trackTitle}>
                  {track?.filename
                    ? track.filename.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '')
                    : track?.name || 'Titre inconnu'}
                </Text>
                <Text numberOfLines={1} style={styles.trackArtist}>
                  TressBit Audio Engine • Stockage Local
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(track)}>
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={26}
                  color={favorite ? '#FF0055' : '#00FF66'}
                />
              </TouchableOpacity>
            </View>

            {/* Barre de progression tactile */}
            <View style={styles.progressSection}>
              <TouchableOpacity
                style={styles.progressBarTouchArea}
                activeOpacity={1}
                onPress={handleSeekProgress}
              >
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                  <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
                </View>
              </TouchableOpacity>

              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(currentSeconds)}</Text>
                <Text style={styles.timeText}>
                  -{formatTime(Math.max(0, totalSeconds - currentSeconds))}
                </Text>
              </View>
            </View>

            {/* Commandes audio complètes */}
            <View style={styles.controlsRow}>
              {/* Bouton Mode de boucle / aléatoire */}
              <TouchableOpacity style={styles.modeBtn} onPress={togglePlayMode} activeOpacity={0.7}>
                {playMode === 'ALL' && <Ionicons name="repeat" size={22} color="#00FF66" />}
                {playMode === 'ONE' && (
                  <MaterialCommunityIcons name="repeat-once" size={24} color="#00FF66" />
                )}
                {playMode === 'SHUFFLE' && <Ionicons name="shuffle" size={22} color="#00FF66" />}
              </TouchableOpacity>

              {/* Morceau précédent */}
              <TouchableOpacity activeOpacity={0.7} onPress={playPreviousTrack}>
                <Ionicons name="play-skip-back" size={26} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Recul 10s */}
              <TouchableOpacity activeOpacity={0.7} onPress={rewind10}>
                <MaterialIcons name="replay-10" size={28} color="#A0AAB0" />
              </TouchableOpacity>

              {/* Play / Pause */}
              <TouchableOpacity
                style={styles.mainPlayBtn}
                activeOpacity={0.8}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={34}
                  color="#000000"
                />
              </TouchableOpacity>

              {/* Avance 10s */}
              <TouchableOpacity activeOpacity={0.7} onPress={forward10}>
                <MaterialIcons name="forward-10" size={28} color="#A0AAB0" />
              </TouchableOpacity>

              {/* Morceau suivant */}
              <TouchableOpacity activeOpacity={0.7} onPress={playNextTrack}>
                <Ionicons name="play-skip-forward" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Réglage du volume */}
            <View style={styles.volumeRow}>
              <Ionicons
                name={volume === 0 ? 'volume-mute' : 'volume-low'}
                size={18}
                color="#888"
              />
              <TouchableOpacity
                style={styles.volumeTouchArea}
                activeOpacity={1}
                onPress={handleVolumeChange}
              >
                <View style={styles.volumeTrack}>
                  <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
                </View>
              </TouchableOpacity>
              <Ionicons name="volume-high" size={18} color="#888" />
            </View>

            {/* Mode actif */}
            <View style={styles.outputPill}>
              <MaterialIcons name="speaker" size={14} color="#FFF" />
              <Text style={styles.outputText}>
                Mode : {playMode === 'ALL' ? 'Boucle liste' : playMode === 'ONE' ? 'Titre unique' : 'Aléatoire'}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#050706' },
  safeContainer: { flex: 1, paddingHorizontal: 16, justifyContent: 'space-between', paddingBottom: 15 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingBadge: { color: '#00FF66', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  playerCardContainer: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 42,
    padding: 2,
    backgroundColor: 'rgba(0, 255, 102, 0.25)',
  },
  playerCard: { flex: 1, borderRadius: 40, padding: 22, justifyContent: 'space-between' },
  artworkContainer: { width: '100%', height: width * 0.68, borderRadius: 28, overflow: 'hidden' },
  artworkPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 6 },
  titleTextWrapper: { flex: 1, marginRight: 15 },
  trackTitle: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginBottom: 4 },
  trackArtist: { color: '#8A929A', fontSize: 13 },
  progressSection: { marginVertical: 4 },
  progressBarTouchArea: {
    height: 28,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00FF66',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -4.5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00FF66',
    marginLeft: -7,
    elevation: 4,
    shadowColor: '#00FF66',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { color: '#6E767E', fontSize: 12 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  modeBtn: { padding: 8 },
  mainPlayBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#00FF66',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  volumeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  volumeTouchArea: { flex: 1, height: 30, justifyContent: 'center' },
  volumeTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  volumeFill: { height: '100%', borderRadius: 2, backgroundColor: '#FFF' },
  outputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  outputText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
});