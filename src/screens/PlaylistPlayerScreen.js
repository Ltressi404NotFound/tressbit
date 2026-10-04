import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PLAYLIST_GENRES } from './PlaylistScreen';

const { width } = Dimensions.get('window');

export default function PlaylistPlayerScreen({ track, playlist, onBack }) {
  const genreConfig = PLAYLIST_GENRES[playlist.genreKey] || PLAYLIST_GENRES.MELODY_RAP;

  const player = useAudioPlayer(track?.uri);
  const status = useAudioPlayerStatus(player);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (status) setIsPlaying(status.playing);
  }, [status?.playing]);

  useEffect(() => {
    if (player && typeof player.play === 'function') {
      try {
        player.play();
      } catch (e) {
        console.warn('Erreur lecture playlist:', e);
      }
    }
    // Nettoyage vide : expo-audio libère lui-même la ressource partagée
    return () => {};
  }, [player]);

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) player.pause();
    else player.play();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSeconds = status?.currentTime || 0;
  const totalSeconds = status?.duration || track?.duration || 1;
  const progressPercent = Math.min((currentSeconds / totalSeconds) * 100, 100);

  return (
    <LinearGradient colors={genreConfig.gradient} style={styles.backdrop}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeContainer}>
        {/* En-tête */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.circleBtn} onPress={onBack}>
            <Ionicons name="chevron-down" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.badgeContainer}>
            <Text style={[styles.nowPlayingBadge, { color: genreConfig.primary }]}>
              {playlist.name.toUpperCase()} • {genreConfig.label.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Player Card thématique */}
        <View style={[styles.playerCardContainer, { borderColor: genreConfig.primary }]}>
          <LinearGradient colors={['#181B1E', '#0B0D0F']} style={styles.playerCard}>
            <View style={styles.artworkContainer}>
              <LinearGradient colors={genreConfig.gradient} style={styles.artworkPlaceholder}>
                <Ionicons name={genreConfig.icon} size={84} color={genreConfig.primary} />
              </LinearGradient>
            </View>

            <View style={styles.titleRow}>
              <View style={styles.titleTextWrapper}>
                <Text numberOfLines={1} style={styles.trackTitle}>
                  {track ? track.filename?.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '') : 'Aucun son sélectionné'}
                </Text>
                <Text numberOfLines={1} style={styles.trackArtist}>
                  Playlist • {genreConfig.label}
                </Text>
              </View>
              <Ionicons name="heart" size={24} color={genreConfig.primary} />
            </View>

            {/* Slider de Progression thématique */}
            <View style={styles.progressSection}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%`, backgroundColor: genreConfig.primary },
                  ]}
                />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(currentSeconds)}</Text>
                <Text style={styles.timeText}>-{formatTime(Math.max(0, totalSeconds - currentSeconds))}</Text>
              </View>
            </View>

            {/* Commandes */}
            <View style={styles.controlsRow}>
              <TouchableOpacity onPress={() => player?.seekTo(0)}>
                <Ionicons name="play-skip-back" size={32} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mainPlayBtn, { backgroundColor: genreConfig.primary }]}
                activeOpacity={0.8}
                onPress={togglePlay}
              >
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="play-skip-forward" size={32} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Sortie */}
            <View style={styles.outputPill}>
              <MaterialIcons name="audiotrack" size={14} color="#FFF" />
              <Text style={styles.outputText}>TressBit Engine • Profil {genreConfig.label}</Text>
            </View>
          </LinearGradient>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
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
  badgeContainer: { alignItems: 'center' },
  nowPlayingBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  playerCardContainer: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 42,
    padding: 1.5,
    borderWidth: 1.5,
  },
  playerCard: { flex: 1, borderRadius: 40, padding: 24, justifyContent: 'space-between' },
  artworkContainer: { width: '100%', height: width * 0.72, borderRadius: 28, overflow: 'hidden' },
  artworkPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  titleTextWrapper: { flex: 1, marginRight: 15 },
  trackTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  trackArtist: { color: '#8A929A', fontSize: 14 },
  progressSection: { marginVertical: 6 },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  timeText: { color: '#6E767E', fontSize: 12 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 4 },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
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