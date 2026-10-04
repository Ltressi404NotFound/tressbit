import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function DeviceMusicScreen({ onBack, onSelectTrack }) {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);

  // --- Animations Mascotte Fantôme & Ondes ---
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 1. Lévitation douce du fantôme
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

    // 2. Ondes concentriques du casque
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

    autoScanAudio();
  }, []);

  const autoScanAudio = async () => {
    try {
      setLoading(true);
      const permission = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(permission.granted);

      if (!permission.granted) {
        setLoading(false);
        return;
      }

      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
      });

      const validTracks = (media.assets || [])
        .filter((file) => file.duration && file.duration >= 60)
        .sort((a, b) => (b.modificationTime || 0) - (a.modificationTime || 0));

      setSongs(validTracks);
      setFilteredSongs(validTracks);
    } catch (error) {
      console.error('Erreur scan audio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredSongs(songs);
      return;
    }
    const filtered = songs.filter((item) =>
      item.filename.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredSongs(filtered);
  };

  const handleShuffleAll = () => {
    if (filteredSongs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredSongs.length);
    onSelectTrack(filteredSongs[randomIndex], filteredSongs);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cleanTitle = (filename) => {
    return filename.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '');
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.trackCard}
      activeOpacity={0.75}
      onPress={() => onSelectTrack(item, filteredSongs)}
    >
      {/* Index ou badge discret */}
      <View style={styles.indexBox}>
        <Text style={styles.indexText}>{index < 9 ? `0${index + 1}` : index + 1}</Text>
      </View>

      {/* Mini avatar musique aux tons pastel */}
      <View style={styles.coverBox}>
        <Ionicons name="musical-notes" size={18} color="#95B8C0" />
      </View>

      {/* Titre et détails */}
      <View style={styles.trackDetails}>
        <Text numberOfLines={1} style={styles.trackName}>
          {cleanTitle(item.filename)}
        </Text>
        <Text style={styles.trackMeta}>
          Local Audio • {formatDuration(item.duration)}
        </Text>
      </View>

      {/* Bouton de lecture doux */}
      <View style={styles.playIconBtn}>
        <Ionicons name="play" size={14} color="#242A35" />
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.headerSubtitle}>BIBLIOTHÈQUE LOCALE</Text>
            <Text style={styles.headerTitle}>Sur l'appareil</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={autoScanAudio}>
            <Ionicons name="refresh" size={20} color="#242A35" />
          </TouchableOpacity>
        </View>

        {/* --- BANDEAU MASCOTTE FANTÔME ANIMÉ --- */}
        <View style={styles.mascotBanner}>
          <LinearGradient
            colors={['#FFFFFF', '#E6EEF0']}
            style={styles.bannerGradient}
          >
            {/* Onde sonore pulsante */}
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

            {/* Fantôme flottant */}
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
              <Text style={styles.bannerCounter}>
                {songs.length} morceau{songs.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.bannerSubtext}>
                Détectés hors-ligne avec une durée supérieure à 60s.
              </Text>

              {/* Bouton Shuffle All */}
              <TouchableOpacity
                style={styles.shuffleBtn}
                activeOpacity={0.8}
                onPress={handleShuffleAll}
              >
                <Ionicons name="shuffle" size={16} color="#FFFFFF" />
                <Text style={styles.shuffleBtnText}>Tout mélanger</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* --- BARRE DE RECHERCHE DOUCE --- */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#7E979E" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un son par titre..."
            placeholderTextColor="#7E979E"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color="#7E979E" />
            </TouchableOpacity>
          )}
        </View>

        {/* --- LISTE DES MORCEAUX OU ÉTATS --- */}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#95B8C0" />
            <Text style={styles.statusLabel}>Scan de la mémoire locale...</Text>
          </View>
        ) : !hasPermission ? (
          <View style={styles.centerState}>
            <Ionicons name="alert-circle" size={44} color="#242A35" />
            <Text style={styles.statusLabel}>Accès aux fichiers audio refusé.</Text>
            <TouchableOpacity style={styles.primaryActionBtn} onPress={autoScanAudio}>
              <Text style={styles.primaryActionText}>Autoriser l'accès</Text>
            </TouchableOpacity>
          </View>
        ) : filteredSongs.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="musical-notes-outline" size={48} color="#7E979E" />
            <Text style={styles.statusLabel}>
              {searchQuery ? 'Aucun morceau correspondant.' : 'Aucun fichier audio (> 60s) trouvé.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSongs}
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

  // HEADER
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

  // BANDEAU MASCOTTE
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
  shuffleBtn: {
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
  shuffleBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // RECHERCHE
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 14,
    shadowColor: '#242A35',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#242A35',
    fontWeight: '600',
  },

  // LISTE
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
    shadowColor: '#242A35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
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
    color: '#7E979E',
  },
  coverBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EBF2F4',
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
    color: '#242A35',
    marginBottom: 3,
  },
  trackMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7E979E',
  },
  playIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCE3E5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },

  // ÉTATS
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 30,
  },
  statusLabel: {
    color: '#658189',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryActionBtn: {
    backgroundColor: '#242A35',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 6,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});