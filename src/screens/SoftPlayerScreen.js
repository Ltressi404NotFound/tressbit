import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { AudioContext } from '../contexts/AudioContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { PLAYLIST_THEMES } from '../utils/themes';

const { width } = Dimensions.get('window');

export default function SoftPlayerScreen({ onBack, playlistTitle = 'Rock With Me', customTheme }) {
  const {
    activeTrack,
    currentQueue,
    isPlaying,
    status,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    playTrack,
    playModeIndex,
    togglePlayMode,
  } = useContext(AudioContext);

  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  // Vue 0 = Grand Lecteur (Cadre 1), Vue 1 = Liste des musiques (Cadre 2)
  const [viewMode, setViewMode] = useState(0); 
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const theme = customTheme || PLAYLIST_THEMES.LOVE;

  const switchView = (mode) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setViewMode(mode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const currentSeconds = Math.max(0, Math.floor(Number(status?.currentTime) || 0));
  const rawDuration = status?.duration || activeTrack?.duration || 0;
  const totalSeconds = Math.max(
    1,
    rawDuration > 10000 ? Math.floor(rawDuration / 1000) : Math.floor(rawDuration || 1)
  );
  const progressPercent = Math.min((currentSeconds / totalSeconds) * 100, 100);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e) => {
    const { locationX } = e.nativeEvent;
    const barWidth = width - 80;
    const ratio = Math.max(0, Math.min(1, locationX / barWidth));
    seekTo(Math.floor(ratio * totalSeconds));
  };

  const cleanTitle = (str) =>
    str ? str.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '') : 'Morceau Inconnu';

  const favorite = isFavorite(activeTrack?.id, activeTrack?.uri);

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Top Header commun */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={theme.textDark} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={[styles.albumSubtitle, { color: theme.textMuted }]}>PLAYLIST / ALBUM</Text>
            <Text numberOfLines={1} style={[styles.albumTitle, { color: theme.textDark }]}>
              {playlistTitle}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => switchView(viewMode === 0 ? 1 : 0)}
          >
            <Ionicons
              name={viewMode === 0 ? 'list' : 'disc-outline'}
              size={22}
              color={theme.textDark}
            />
          </TouchableOpacity>
        </View>

        {/* CONTENU ANIMÉ : CADRE 1 OU CADRE 2 */}
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          {viewMode === 0 ? (
            /* ================= CADRE 1 : GRAND LECTEUR ================= */
            <View style={styles.playerWrapper}>
              {/* Grand Artwork Carré Doux */}
              <View style={[styles.artworkBox, { backgroundColor: theme.cardBg }]}>
                <Ionicons name="headset" size={90} color={theme.primary} />
              </View>

              {/* Titre & Artiste */}
              <View style={styles.trackInfoBox}>
                <Text numberOfLines={1} style={[styles.trackTitle, { color: theme.textDark }]}>
                  {cleanTitle(activeTrack?.filename || activeTrack?.name)}
                </Text>
                <Text style={[styles.artistName, { color: theme.textMuted }]}>
                  TressBit Artist • Local
                </Text>
              </View>

              {/* Barre de progression fine et douce */}
              <View style={styles.progressContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={styles.touchableBar}
                  onPress={handleSeek}
                >
                  <View style={[styles.barBg, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${progressPercent}%`, backgroundColor: theme.primary },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
                <View style={styles.timeRow}>
                  <Text style={[styles.timeText, { color: theme.textMuted }]}>
                    {formatTime(currentSeconds)}
                  </Text>
                  <Text style={[styles.timeText, { color: theme.textMuted }]}>
                    {formatTime(totalSeconds)}
                  </Text>
                </View>
              </View>

              {/* Contrôles principaux ronds soft */}
              <View style={styles.controlsRow}>
                <TouchableOpacity onPress={playPrevious} activeOpacity={0.7}>
                  <Ionicons name="play-skip-back" size={24} color={theme.textDark} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bigPlayBtn, { backgroundColor: theme.cardBg }]}
                  activeOpacity={0.8}
                  onPress={togglePlayPause}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={28}
                    color={theme.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={playNext} activeOpacity={0.7}>
                  <Ionicons name="play-skip-forward" size={24} color={theme.textDark} />
                </TouchableOpacity>
              </View>

              {/* Boutons d'options secondaires */}
              <View style={styles.secondaryControls}>
                <TouchableOpacity onPress={togglePlayMode}>
                  <Ionicons
                    name={playModeIndex === 2 ? 'shuffle' : 'repeat'}
                    size={20}
                    color={playModeIndex !== 0 ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleFavorite(activeTrack)}>
                  <Ionicons
                    name={favorite ? 'heart' : 'heart-outline'}
                    size={22}
                    color={favorite ? '#FF3366' : theme.textMuted}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => switchView(1)}>
                  <Feather name="share-2" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Volet "Up Next" rétractable vers le bas */}
              <TouchableOpacity
                style={styles.upNextCard}
                activeOpacity={0.9}
                onPress={() => switchView(1)}
              >
                <View>
                  <Text style={[styles.upNextTitle, { color: theme.textDark }]}>Up Next</Text>
                  <Text numberOfLines={1} style={[styles.upNextSong, { color: theme.textMuted }]}>
                    {currentQueue.length > 1
                      ? cleanTitle(currentQueue[1]?.filename || currentQueue[1]?.name)
                      : 'Fin de liste'}
                  </Text>
                </View>
                <Ionicons name="chevron-up" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            /* ================= CADRE 2 : VUE LISTE & MINI CONTROLS ================= */
            <View style={styles.listWrapper}>
              {/* Entête avec Mini Contrôleur (Comme sur l'image à droite) */}
              <View style={styles.listMiniPlayer}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text numberOfLines={1} style={[styles.listTrackTitle, { color: theme.textDark }]}>
                    {cleanTitle(activeTrack?.filename || activeTrack?.name)}
                  </Text>
                  <Text style={[styles.listArtist, { color: theme.textMuted }]}>
                    {currentQueue.length} morceaux au total
                  </Text>
                </View>

                {/* Mini boutons Précédent / Play / Suivant */}
                <View style={styles.miniControls}>
                  <TouchableOpacity onPress={playPrevious} style={styles.miniBtn}>
                    <Ionicons name="play-skip-back" size={16} color={theme.textDark} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={togglePlayPause}
                    style={[styles.miniPlayBtn, { backgroundColor: theme.cardBg }]}
                  >
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={18}
                      color={theme.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={playNext} style={styles.miniBtn}>
                    <Ionicons name="play-skip-forward" size={16} color={theme.textDark} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Séparateur subtil */}
              <View style={[styles.divider, { backgroundColor: 'rgba(0,0,0,0.05)' }]} />

              {/* Liste des musiques avec numérotation 01, 02... */}
              <FlatList
                data={currentQueue}
                keyExtractor={(item, index) => item.id || item.uri || index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                  const isCurrent = (activeTrack?.id && activeTrack.id === item.id) || activeTrack?.uri === item.uri;
                  const itemFav = isFavorite(item.id, item.uri);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.songRow,
                        isCurrent && { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 12 },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => playTrack(item, currentQueue, theme)}
                    >
                      <Text style={[styles.songIndex, { color: isCurrent ? theme.primary : theme.textMuted }]}>
                        {index < 9 ? `0${index + 1}` : index + 1}
                      </Text>

                      {/* Mini carré Artwork */}
                      <View style={[styles.miniThumb, { backgroundColor: theme.cardBg }]}>
                        <Ionicons
                          name={isCurrent ? 'musical-notes' : 'musical-note'}
                          size={14}
                          color={isCurrent ? theme.primary : theme.textMuted}
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.songRowTitle,
                          { color: isCurrent ? theme.primary : theme.textDark, fontWeight: isCurrent ? '700' : '500' },
                        ]}
                      >
                        {cleanTitle(item.filename || item.name)}
                      </Text>

                      <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ padding: 6 }}>
                        <Ionicons
                          name={itemFav ? 'heart' : 'heart-outline'}
                          size={18}
                          color={itemFav ? '#FF3366' : theme.textMuted}
                        />
                      </TouchableOpacity>

                      <Ionicons name="ellipsis-horizontal" size={16} color={theme.textMuted} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 22 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBtn: { padding: 6 },
  headerTitleBox: { alignItems: 'center' },
  albumSubtitle: { fontSize: 10, letterSpacing: 1.5, fontWeight: '700' },
  albumTitle: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  // Cadre 1 (Player)
  playerWrapper: { flex: 1, justifyContent: 'space-between', paddingVertical: 16 },
  artworkBox: {
    width: width * 0.76,
    height: width * 0.76,
    borderRadius: 24,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  trackInfoBox: { alignItems: 'center', marginVertical: 12 },
  trackTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  artistName: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  progressContainer: { marginVertical: 8 },
  touchableBar: { height: 20, justifyContent: 'center' },
  barBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  timeText: { fontSize: 11, fontWeight: '500' },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
    marginVertical: 10,
  },
  bigPlayBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 8,
  },
  upNextCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  upNextTitle: { fontSize: 13, fontWeight: '700' },
  upNextSong: { fontSize: 11, marginTop: 2 },

  // Cadre 2 (Liste)
  listWrapper: { flex: 1, paddingTop: 10 },
  listMiniPlayer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listTrackTitle: { fontSize: 18, fontWeight: '800' },
  listArtist: { fontSize: 12, marginTop: 2 },
  miniControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniBtn: { padding: 4 },
  miniPlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: { height: 1, width: '100%', marginBottom: 16 },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  songIndex: { width: 28, fontSize: 12, fontWeight: '600' },
  miniThumb: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  songRowTitle: { flex: 1, fontSize: 14, marginRight: 8 },
});