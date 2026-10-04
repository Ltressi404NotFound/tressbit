import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PLAYLIST_THEMES } from '../utils/themes';

const STORAGE_KEY_PLAYLISTS = '@tressbit_custom_playlists';

export default function PlaylistScreen({ onBack, onOpenPlaylistDetail }) {
  const [playlists, setPlaylists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [selectedGenreKey, setSelectedGenreKey] = useState('LOVE');

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

    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (stored) {
        setPlaylists(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erreur chargement playlists:', e);
    }
  };

  const savePlaylists = async (newList) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(newList));
      setPlaylists(newList);
    } catch (e) {
      console.error('Erreur sauvegarde playlist:', e);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!name.trim()) return;

    const newPlaylist = {
      id: Date.now().toString(),
      name: name.trim(),
      genreKey: selectedGenreKey,
      tracks: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [newPlaylist, ...playlists];
    await savePlaylists(updated);

    setName('');
    setSelectedGenreKey('LOVE');
    setModalVisible(false);
  };

  const renderPlaylistItem = ({ item }) => {
    const theme = (PLAYLIST_THEMES && PLAYLIST_THEMES[item?.genreKey]) || PLAYLIST_THEMES?.LOVE || {
      cardBg: '#FCE0E8',
      primary: '#E06D88',
      icon: 'heart',
      label: 'Love',
    };
    const count = Array.isArray(item?.tracks) ? item.tracks.length : 0;

    return (
      <TouchableOpacity
        style={styles.playlistCard}
        activeOpacity={0.8}
        onPress={() => onOpenPlaylistDetail && onOpenPlaylistDetail(item)}
      >
        <View style={[styles.genreBadge, { backgroundColor: theme.cardBg }]}>
          <Ionicons name={theme.icon} size={22} color={theme.primary} />
        </View>

        <View style={styles.playlistDetails}>
          <Text numberOfLines={1} style={styles.playlistName}>
            {item.name}
          </Text>
          <View style={styles.genreLabelRow}>
            <View style={[styles.dotIndicator, { backgroundColor: theme.primary }]} />
            <Text style={[styles.genreLabelText, { color: theme.primary }]}>
              {theme.label}
            </Text>
            <Text style={styles.trackCountText}>• {count} titre{count > 1 ? 's' : ''}</Text>
          </View>
        </View>

        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={16} color="#242A35" />
        </View>
      </TouchableOpacity>
    );
  };

  // Sécurité absolue pour le bouton de validation
  const currentThemeObj = (PLAYLIST_THEMES && PLAYLIST_THEMES[selectedGenreKey]) || PLAYLIST_THEMES?.LOVE;
  const saveButtonColor = currentThemeObj?.primary || '#242A35';

  return (
    <LinearGradient
      colors={['#EBF2F4', '#D4E4E8', '#BDD5DC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* --- HEADER NAVIGATION --- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color="#242A35" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>ORGANISATION</Text>
            <Text style={styles.headerTitle}>Mes Playlists</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#242A35" />
          </TouchableOpacity>
        </View>

        {/* --- BANDEAU MASCOTTE FANTÔME ANIMÉ --- */}
        <View style={styles.mascotBanner}>
          <LinearGradient
            colors={['#FFFFFF', '#E6EEF0']}
            style={styles.bannerGradient}
          >
            <Animated.View
              style={[
                styles.soundWave,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [0.8, 1.25],
                    outputRange: [0.45, 0],
                  }),
                },
              ]}
            />

            <Animated.View
              style={[
                styles.ghostWrapper,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Image
                source={require('../../assets/ghost.png')}
                style={styles.ghostImg}
                resizeMode="contain"
              />
            </Animated.View>

            <View style={styles.bannerTextWrapper}>
              <View style={styles.badgeRow}>
                <MaterialCommunityIcons name="playlist-music" size={12} color="#242A35" />
                <Text style={styles.badgeText}>COLLECTIONS</Text>
              </View>
              <Text style={styles.bannerCounter}>
                {playlists.length} playlist{playlists.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.bannerSubtext}>
                Classe tes sons par ambiance et humeur musicale.
              </Text>

              <TouchableOpacity
                style={styles.createActionBtn}
                activeOpacity={0.8}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                <Text style={styles.createActionBtnText}>Créer une playlist</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* --- LISTE DES PLAYLISTS OU ÉTAT VIDE --- */}
        {playlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="playlist-plus" size={40} color="#7E979E" />
            </View>
            <Text style={styles.emptyTitle}>Aucune playlist pour l'instant</Text>
            <Text style={styles.emptySubtitle}>
              Touche "Créer une playlist" pour organiser tes morceaux avec une ambiance et un thème dédiés.
            </Text>
          </View>
        ) : (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={renderPlaylistItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* --- MODALE DE CRÉATION DE PLAYLIST --- */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nouvelle Playlist</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={20} color="#242A35" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Titre de la playlist</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Chill Session, Hip-Hop Vibes..."
                placeholderTextColor="#7E979E"
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <Text style={styles.inputLabel}>Thème & Ambiance sonore</Text>
              <View style={styles.genreGrid}>
                {Object.keys(PLAYLIST_THEMES || {}).map((key) => {
                  const theme = PLAYLIST_THEMES[key];
                  if (!theme) return null;
                  const isSelected = selectedGenreKey === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.genreCard,
                        {
                          backgroundColor: isSelected ? theme.cardBg : '#F5F8F9',
                          borderColor: isSelected ? theme.primary : 'transparent',
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedGenreKey(key)}
                    >
                      <Ionicons
                        name={theme.icon}
                        size={20}
                        color={isSelected ? theme.primary : '#7E979E'}
                      />
                      <Text
                        style={[
                          styles.genreName,
                          { color: isSelected ? theme.primary : '#242A35' },
                        ]}
                      >
                        {theme.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: saveButtonColor },
                ]}
                activeOpacity={0.8}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.saveBtnText}>Créer et enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    shadowColor: '#242A35',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerCenter: { alignItems: 'center' },
  headerSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5E7B83',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#242A35',
    marginTop: 2,
  },
  mascotBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 14,
    shadowColor: '#5E7B83',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
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
    borderColor: '#95B8C0',
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#242A35',
    letterSpacing: 1,
  },
  bannerCounter: {
    fontSize: 18,
    fontWeight: '900',
    color: '#242A35',
  },
  bannerSubtext: {
    fontSize: 11,
    color: '#658189',
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 15,
  },
  createActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242A35',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
    marginTop: 8,
  },
  createActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  listContainer: {
    paddingBottom: 30,
    gap: 12,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#242A35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  genreBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  playlistDetails: {
    flex: 1,
    marginRight: 10,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#242A35',
    marginBottom: 4,
  },
  genreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  genreLabelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trackCountText: {
    fontSize: 12,
    color: '#7E979E',
    fontWeight: '600',
  },
  cardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF2F4',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#242A35',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#242A35',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#658189',
    textAlign: 'center',
    lineHeight: 17,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(36, 42, 53, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#242A35',
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EBF2F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#5E7B83',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F8F9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#242A35',
    marginBottom: 16,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  genreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  genreName: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});