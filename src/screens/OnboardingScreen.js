import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: '100% Hors-Ligne & Chill',
    subtitle: 'Emporte toute ta bibliothèque musicale locale partout avec toi, sans consommer un seul ko de data[cite: 5].',
    image: require('../../assets/onboard_1.jpg'),
  },
  {
    id: '2',
    title: 'Contrôle & Précision',
    subtitle: 'Navigue avec fluidité dans tes morceaux grâce au lecteur tactile avancé et aux modes d’écoute sur-mesure[cite: 4].',
    image: require('../../assets/onboard_2.jpg'),
  },
  {
    id: '3',
    title: 'Ton Univers TressBit',
    subtitle: 'Organise tes playlists par ambiances et profite d’une expérience fluide, élégante et taillée pour toi[cite: 6].',
    image: require('../../assets/onboard_3.jpg'),
  },
];

export default function WelcomeCarouselScreen({ onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      if (onFinish) onFinish();
    }
  };

  return (
    <LinearGradient
      colors={['#EBF2F4', '#D4E4E8', '#BDD5DC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        {/* Bouton Passer (Skip) en haut */}
        <View style={styles.topBar}>
          <Text style={styles.brandLogo}>TRESSBIT</Text>
          {currentIndex < SLIDES.length - 1 && (
            <TouchableOpacity onPress={onFinish} activeOpacity={0.7}>
              <Text style={styles.skipText}>Passer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Carrousel d'images et textes */}
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          keyExtractor={(item) => item.id}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={styles.slideContainer}>
              {/* Image d'onboarding encadrée avec style doux */}
              <View style={styles.imageCard}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
              </View>

              {/* Texte descriptif */}
              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />

        {/* Pied de page : Indicateurs (Dots) et Bouton Suivant / Commencer */}
        <View style={styles.footer}>
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  brandLogo: {
    fontSize: 12,
    fontWeight: '900',
    color: '#5E7B83',
    letterSpacing: 2,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#658189',
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  imageCard: {
    width: width * 0.82,
    height: height * 0.46,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#242A35',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#242A35',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#658189',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(36, 42, 53, 0.2)',
  },
  activeDot: {
    width: 22,
    backgroundColor: '#242A35',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242A35',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 22,
    gap: 8,
    shadowColor: '#242A35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});