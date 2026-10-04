import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Définition interne sécurisée des thèmes
const PLAYLIST_THEMES = {
  LOVE: {
    id: 'love',
    label: 'Love',
    gradient: ['#FDE7ED', '#F9D1DC', '#F4BAC9'],
    cardBg: '#FCE0E8',
    primary: '#E06D88',
    textDark: '#44222B',
    textMuted: '#8E6773',
    icon: 'heart',
  },
  CALM_SAD: {
    id: 'calm_sad',
    label: 'Calme & Triste',
    gradient: ['#EBF4FB', '#D4E8F8', '#BADBF4'],
    cardBg: '#DCEBF7',
    primary: '#4F8BC9',
    textDark: '#1E3246',
    textMuted: '#688099',
    icon: 'water',
  },
  MELODY_RAP: {
    id: 'melody_rap',
    label: 'Mélodie & Rap',
    gradient: ['#EDF7EE', '#D6EDD8', '#BDE2C0'],
    cardBg: '#E0F0E2',
    primary: '#439B54',
    textDark: '#1C3822',
    textMuted: '#65866B',
    icon: 'flash',
  },
  DANCE: {
    id: 'dance',
    label: 'Danse',
    gradient: ['#FFF5EB', '#FFE5CC', '#FFD2A6'],
    cardBg: '#FCE7D2',
    primary: '#E67E22',
    textDark: '#4A2800',
    textMuted: '#966D43',
    icon: 'fire',
  },
};

const STORAGE_KEY_PLAYLISTS = '@tressbit_custom_playlists';

export default function PlaylistDetailScreen({
  playlist,
  onBack,
  onOpenAddSongs,
  onPlayTrack,
}) {
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist);

  // --- Animations Mascotte Fantôme & Ondes ---
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [playlist]);

  // Récupération sécurisée du thème (Ligne 25 corrigée)
  const theme = PLAYLIST_THEMES[currentPlaylist?.genreKey] || PLAYLIST_THEMES.LOVE;
  const tracks = Array.isArray(currentPlaylist?.tracks) ? currentPlaylist.tracks : [];

  const handleRemoveTrack = async (trackUri) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (!stored) return;
      const allPlaylists = JSON.parse(stored);

      const updatedPlaylists = allPlaylists.map((pl) => {
        if (pl.id === currentPlaylist.id) {
          const newTracks = pl.tracks.filter((t) => (t.uri || t.id) !== trackUri);
          return { ...pl, tracks: newTracks };
        }
        return pl;
      });

      await AsyncStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updatedPlaylists));
      const updatedCurrent = updatedPlaylists.find((pl) => pl.id === currentPlaylist.id);
      setCurrentPlaylist(updatedCurrent);
    } catch (e) {
      console.warn('Erreur suppression son de playlist:', e);
    }
  };

  const cleanTitle = (str) => {
    if (!str) return 'Titre inconnu';
    return str.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '');
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.trackCard}
      activeOpacity={0.75}
      onPress={() => onPlayTrack(item, tracks)}
    >
      <View style={styles.indexBox}>
        <Text style={[styles.indexText, { color: theme.primary }]}>
          {index < 9 ? `0${index + 1}` : index + 1}
        </Text>
      </View>

      <View style={[styles.coverBox, { backgroundColor: theme.cardBg }]}>
        <Ionicons name={theme.icon} size={16} color={theme.primary} />
      </View>

      <View style={styles.trackDetails}>
        <Text numberOfLines={1} style={[styles.trackName, { color: theme.textDark }]}>
          {cleanTitle(item.filename || item.name)}
        </Text>
        <Text style={[styles.trackMeta, { color: theme.textMuted }]}>
          Playlist Track • {Math.floor((item.duration || 0) / 60)}:
          {Math.floor((item.duration || 0) % 60) < 10 ? '0' : ''}
          {Math.floor((item.duration || 0) % 60)}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionIconBtn}
        onPress={() => handleRemoveTrack(item.uri || item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={16} color={theme.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.playIconBtn, { backgroundColor: theme.cardBg }]}
        onPress={() => onPlayTrack(item, tracks)}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={13} color={theme.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* --- HEADER --- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={theme.textDark} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>DÉTAIL PLAYLIST</Text>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.textDark }]}>
              {currentPlaylist.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.cardBg }]}
            onPress={onOpenAddSongs}
          >
            <Ionicons name="add" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* --- BANDEAU MASCOTTE FANTÔME ANIMÉ --- */}
        <View style={styles.mascotBanner}>
          <LinearGradient colors={['#FFFFFF', '#F7F9FA']} style={styles.bannerGradient}>
            <Animated.View
              style={[
                styles.soundWave,
                {
                  borderColor: theme.primary,
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [0.8, 1.25],
                    outputRange: [0.45, 0],
                  }),
                },
              ]}
            />

            <Animated.View
              style={[styles.ghostWrapper, { transform: [{ translateY: floatAnim }] }]}
            >
              <Image
                source={require('../../assets/ghost.png')}
                style={styles.ghostImg}
                resizeMode="contain"
              />
            </Animated.View>

            <View style={styles.bannerTextWrapper}>
              <View style={[styles.badgePill, { backgroundColor: theme.cardBg }]}>
                <Ionicons name={theme.icon} size={12} color={theme.primary} />
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {theme.label.toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.bannerCounter, { color: theme.textDark }]}>
                {tracks.length} morceau{tracks.length > 1 ? 's' : ''}
              </Text>
              <Text style={[styles.bannerSubtext, { color: theme.textMuted }]}>
                Musiques configurées pour cette ambiance.
              </Text>

              {tracks.length > 0 && (
                <TouchableOpacity
                  style={[styles.playAllBtn, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                  onPress={() => onPlayTrack(tracks[0], tracks)}
                >
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                  <Text style={styles.playAllBtnText}>Écouter la playlist</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* --- LISTE DES MORCEAUX OU ÉTAT VIDE --- */}
        {tracks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.cardBg }]}>
              <Ionicons name="musical-notes-outline" size={38} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textDark }]}>
              Cette playlist est vide
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              Touche le bouton "+" en haut à droite pour y ajouter tes morceaux locaux.
            </Text>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
              onPress={onOpenAddSongs}
            >
              <Text style={styles.primaryActionText}>Ajouter des musiques</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id || item.uri}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mascotBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  soundWave: {
    position: 'absolute',
    left: 12,
    top: 10,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
  },
  ghostWrapper: {
    width: 80,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostImg: {
    width: '100%',
    height: '100%',
  },
  bannerTextWrapper: {
    flex: 1,
    marginLeft: 14,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bannerCounter: {
    fontSize: 18,
    fontWeight: '900',
  },
  bannerSubtext: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 15,
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    marginTop: 8,
  },
  playAllBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  listContainer: {
    paddingBottom: 30,
    gap: 10,
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: { ios: 0.04, android: 0.04 },
    shadowRadius: 6,
    elevation: 2,
  },
  indexBox: {
    width: 24,
    marginRight: 6,
  },
  indexText: {
    fontSize: 11,
    fontWeight: '700',
  },
  coverBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
    marginRight: 10,
  },
  trackName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  trackMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionIconBtn: {
    padding: 8,
    marginRight: 2,
  },
  playIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  primaryActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginTop: 10,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});