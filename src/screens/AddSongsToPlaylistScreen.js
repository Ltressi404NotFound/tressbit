import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as MediaLibrary from 'expo-media-library/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PLAYLIST_GENRES } from './PlaylistScreen';

const STORAGE_KEY_PLAYLISTS = '@tressbit_custom_playlists';

export default function AddSongsToPlaylistScreen({ playlist, onBack, onUpdated }) {
  const [deviceSongs, setDeviceSongs] = useState([]);
  const [currentPlaylistTracks, setCurrentPlaylistTracks] = useState(playlist.tracks || []);
  const [loading, setLoading] = useState(true);

  const genre = PLAYLIST_GENRES[playlist.genreKey] || PLAYLIST_GENRES.MELODY_RAP;

  useEffect(() => {
    loadAllDeviceSongs();
  }, []);

  const loadAllDeviceSongs = async () => {
    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
      });

      const validTracks = (media.assets || [])
        .filter((file) => file.duration && file.duration >= 60)
        .sort((a, b) => (b.modificationTime || 0) - (a.modificationTime || 0));

      setDeviceSongs(validTracks);
    } catch (e) {
      console.error('Erreur scan:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrackInPlaylist = async (track) => {
    const isAlreadyIn = currentPlaylistTracks.some(
      (t) => t.id === track.id || t.uri === track.uri
    );

    let updatedTracks = [];
    if (isAlreadyIn) {
      updatedTracks = currentPlaylistTracks.filter(
        (t) => t.id !== track.id && t.uri !== track.uri
      );
    } else {
      updatedTracks = [track, ...currentPlaylistTracks];
    }

    setCurrentPlaylistTracks(updatedTracks);

    // Sauvegarde persistante dans AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (stored) {
        const playlists = JSON.parse(stored);
        const updatedPlaylists = playlists.map((p) => {
          if (p.id === playlist.id) {
            return { ...p, tracks: updatedTracks };
          }
          return p;
        });

        await AsyncStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updatedPlaylists));
        if (onUpdated) {
          onUpdated({ ...playlist, tracks: updatedTracks });
        }
      }
    } catch (e) {
      console.error('Erreur mise à jour playlist:', e);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <LinearGradient colors={['#041208', '#071F10', '#020503']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Top bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Ajouter à "{playlist.name}"</Text>
            <Text style={[styles.subtitle, { color: genre.primary }]}>
              {currentPlaylistTracks.length} son(s) dans la playlist
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={genre.primary} />
            <Text style={styles.statusText}>Chargement des fichiers audio...</Text>
          </View>
        ) : (
          <FlatList
            data={deviceSongs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isAdded = currentPlaylistTracks.some(
                (t) => t.id === item.id || t.uri === item.uri
              );

              return (
                <View style={styles.trackCard}>
                  <View style={[styles.coverBox, { borderColor: isAdded ? genre.primary : 'transparent' }]}>
                    <Ionicons name="musical-note" size={20} color={isAdded ? genre.primary : '#888'} />
                  </View>

                  <View style={styles.trackDetails}>
                    <Text numberOfLines={1} style={styles.trackName}>
                      {item.filename.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '')}
                    </Text>
                    <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
                  </View>

                  {/* Bouton dynamique : + ou Coche */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: isAdded ? genre.primary : 'rgba(255,255,255,0.08)',
                        borderColor: genre.primary,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => toggleTrackInPlaylist(item)}
                  >
                    <Ionicons
                      name={isAdded ? 'checkmark' : 'add'}
                      size={22}
                      color={isAdded ? '#000' : '#FFF'}
                    />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTitles: { flex: 1 },
  title: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  statusText: { color: '#888', fontSize: 14 },
  list: { paddingBottom: 30, gap: 10 },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(12, 28, 18, 0.65)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  coverBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  trackDetails: { flex: 1, marginRight: 10 },
  trackName: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 3 },
  trackDuration: { color: '#708375', fontSize: 12 },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});