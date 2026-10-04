import React, { useContext, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesContext } from '../contexts/FavoritesContext';

export default function FavoritesScreen({ onBack, onPlayTrack }) {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

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
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const raw = Number(seconds);
    const secs = raw > 10000 ? Math.floor(raw / 1000) : raw;
    const mins = Math.floor(secs / 60);
    const rest = Math.floor(secs % 60);
    return `${mins}:${rest < 10 ? '0' : ''}${rest}`;
  };

  const cleanTitle = (str) => {
    if (!str) return 'Titre inconnu';
    return str.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '');
  };

  const handlePlayAll = () => {
    if (favorites.length === 0) return;
    onPlayTrack(favorites[0], favorites);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.trackCard}
      activeOpacity={0.75}
      onPress={() => onPlayTrack(item, favorites)}
    >
      <View style={styles.indexBox}>
        <Text style={styles.indexText}>{index < 9 ? `0${index + 1}` : index + 1}</Text>
      </View>

      <View style={styles.coverBox}>
        <Ionicons name="musical-notes" size={18} color="#95B8C0" />
      </View>

      <View style={styles.trackDetails}>
        <Text numberOfLines={1} style={styles.trackName}>
          {cleanTitle(item.filename || item.name)}
        </Text>
        <Text style={styles.trackMeta}>
          Favori • {formatDuration(item.duration)}
        </Text>
      </View>

      {/* Cœur interactif pour retirer du favori */}
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={() => toggleFavorite(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={20} color="#242A35" />
      </TouchableOpacity>

      {/* Bouton lecture doux */}
      <TouchableOpacity
        style={styles.playIconBtn}
        onPress={() => onPlayTrack(item, favorites)}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={13} color="#242A35" />
      </TouchableOpacity>
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
            <Text style={styles.headerSubtitle}>COLLECTION PRIVÉE</Text>
            <Text style={styles.headerTitle}>Coups de cœur</Text>
          </View>
          <View style={{ width: 40 }} />
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
              <View style={styles.badgeRow}>
                <Ionicons name="heart" size={12} color="#242A35" />
                <Text style={styles.badgeText}>FAVORITES</Text>
              </View>
              <Text style={styles.bannerCounter}>
                {favorites.length} morceau{favorites.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.bannerSubtext}>
                Retrouve ici tous les sons que tu as likés.
              </Text>

              {favorites.length > 0 && (
                <TouchableOpacity
                  style={styles.playAllBtn}
                  activeOpacity={0.8}
                  onPress={handlePlayAll}
                >
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                  <Text style={styles.playAllBtnText}>Tout écouter</Text>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* --- LISTE DES FAVORIS OU ÉTAT VIDE --- */}
        {favorites.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={40} color="#7E979E" />
            </View>
            <Text style={styles.emptyTitle}>Aucun coup de cœur pour l'instant</Text>
            <Text style={styles.emptySubtitle}>
              Touche le cœur dans le lecteur ou dans la liste pour conserver tes musiques favorites.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
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
  playAllBtn: {
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
  playAllBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
  heartBtn: {
    padding: 6,
    marginRight: 4,
  },
  playIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCE3E5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },

  // ÉTAT VIDE
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
});