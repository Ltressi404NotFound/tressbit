import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Easing,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { AudioContext } from '../contexts/AudioContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({
  onNavigateDevice,
  onNavigatePlaylists,
  onNavigateFavorites,
  onNavigateRecents,
  onOpenPlayer,
}) {
  const favoritesContext = useContext(FavoritesContext);
  const favorites = favoritesContext?.favorites || [];

  const audioContext = useContext(AudioContext);
  const activeTrack = audioContext?.activeTrack;
  const isPlaying = audioContext?.isPlaying;
  const togglePlayPause = audioContext?.togglePlayPause;

  // --- Animations du Fantôme et des Ondes ---
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0.8)).current;
  const pulseAnim2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 1. Animation de flottement du fantôme (Up & Down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Ondes audio pulsantes derrière le casque
    const createPulse = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.25,
            duration: 2000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createPulse(pulseAnim1, 0).start();
    createPulse(pulseAnim2, 1000).start();
  }, []);

  return (
    <LinearGradient
      colors={['#EBF2F4', '#D4E4E8', '#BDD5DC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandSubtitle}>OFFLINE AUDIO PLAYER</Text>
            <Text style={styles.brandTitle}>TressBit</Text>
          </View>
          <View style={styles.avatarPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Ghost Beat</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* --- HERO BANNER AVEC LE FANTÔME ANIMÉ --- */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={['#FFFFFF', '#E6EEF0']}
              style={styles.heroGradient}
            >
              {/* Cercles d'ondes sonores en arrière-plan */}
              <Animated.View
                style={[
                  styles.soundWaveCircle,
                  {
                    transform: [{ scale: pulseAnim1 }],
                    opacity: pulseAnim1.interpolate({
                      inputRange: [0.8, 1.25],
                      outputRange: [0.5, 0],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.soundWaveCircle,
                  {
                    transform: [{ scale: pulseAnim2 }],
                    opacity: pulseAnim2.interpolate({
                      inputRange: [0.8, 1.25],
                      outputRange: [0.5, 0],
                    }),
                  },
                ]}
              />

              {/* Le Bonhomme Mascotte avec animation de lévitation */}
              <Animated.View
                style={[
                  styles.ghostContainer,
                  { transform: [{ translateY: floatAnim }] },
                ]}
              >
                <Image
                  source={require('../../assets/ghost.png')}
                  style={styles.ghostImage}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Textes du Banner */}
              <View style={styles.heroTextContainer}>
                <View style={styles.vibeBadge}>
                  <Ionicons name="musical-notes" size={12} color="#FFFFFF" />
                  <Text style={styles.vibeBadgeText}>CHILL & GROOVE</Text>
                </View>
                <Text style={styles.heroGreeting}>Prêt pour la session ?</Text>
                <Text style={styles.heroDescription}>
                  Tous tes morceaux favoris accessibles sans la moindre connexion.
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* --- TITRE DE SECTION --- */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ma Bibliothèque</Text>
            <View style={styles.sectionLine} />
          </View>

          {/* --- GRILLE 2x2 DOUCE ET ÉPURÉE --- */}
          <View style={styles.grid}>
            {/* 1. Sur l'appareil */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={onNavigateDevice}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#95B8C0' }]}>
                <Ionicons name="folder-open" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Sur l'appareil</Text>
                <Text style={styles.cardSubtitle}>Fichiers locaux</Text>
              </View>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={16} color="#242A35" />
              </View>
            </TouchableOpacity>

            {/* 2. Playlists */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={onNavigatePlaylists}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#242A35' }]}>
                <MaterialCommunityIcons name="playlist-music" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Playlists</Text>
                <Text style={styles.cardSubtitle}>Mixes à thèmes</Text>
              </View>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={16} color="#242A35" />
              </View>
            </TouchableOpacity>

            {/* 3. Favoris */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={onNavigateFavorites}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#B5D0D6' }]}>
                <Ionicons name="heart" size={22} color="#242A35" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Favoris</Text>
                <Text style={[styles.cardSubtitle, { color: '#242A35', fontWeight: '700' }]}>
                  {favorites.length} titre{favorites.length > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={16} color="#242A35" />
              </View>
            </TouchableOpacity>

            {/* 4. Récemment ajoutés */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={onNavigateRecents}
            >
              <View style={[styles.iconWrapper, { backgroundColor: '#DCE3E5' }]}>
                <Ionicons name="time" size={22} color="#242A35" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Récents</Text>
                <Text style={styles.cardSubtitle}>Derniers ajouts</Text>
              </View>
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward" size={16} color="#242A35" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* --- MINI PLAYER FLOTTANT HARMONISÉ --- */}
        {activeTrack && (
          <TouchableOpacity
            style={styles.miniPlayer}
            activeOpacity={0.9}
            onPress={onOpenPlayer}
          >
            <View style={styles.miniGhostThumb}>
              <Ionicons name="disc" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.miniTrackInfo}>
              <Text numberOfLines={1} style={styles.miniTrackTitle}>
                {activeTrack.filename
                  ? activeTrack.filename.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '')
                  : activeTrack.name || 'En lecture'}
              </Text>
              <Text style={styles.miniArtist}>TressBit Engine • En cours</Text>
            </View>
            <TouchableOpacity
              style={styles.miniPlayBtn}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5E7B83',
    letterSpacing: 1.5,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#242A35',
    letterSpacing: -0.5,
  },
  avatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#242A35',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#95B8C0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#242A35',
  },
  scrollContent: {
    paddingBottom: 90,
  },

  // HERO CARD
  heroCard: {
    marginTop: 10,
    marginBottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#5E7B83',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
  },
  heroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 180,
    position: 'relative',
  },
  soundWaveCircle: {
    position: 'absolute',
    left: 20,
    top: 25,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#95B8C0',
  },
  ghostContainer: {
    width: 120,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostImage: {
    width: '100%',
    height: '100%',
  },
  heroTextContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  vibeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242A35',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 5,
    marginBottom: 8,
  },
  vibeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: '#242A35',
    marginBottom: 4,
  },
  heroDescription: {
    fontSize: 12,
    color: '#658189',
    lineHeight: 16,
    fontWeight: '500',
  },

  // SECTION
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#242A35',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(36, 42, 53, 0.1)',
  },

  // GRILLE
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: '47.8%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#242A35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#242A35',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#7E979E',
    marginTop: 2,
    fontWeight: '600',
  },
  cardArrow: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EBF2F4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // MINI PLAYER
  miniPlayer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    height: 64,
    backgroundColor: '#242A35',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#242A35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  miniGhostThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#95B8C0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  miniTrackInfo: {
    flex: 1,
    marginRight: 10,
  },
  miniTrackTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  miniArtist: {
    color: '#95B8C0',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  miniPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#95B8C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});