import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { PLAYLIST_GENRES } from '../screens/PlaylistScreen';

const STORAGE_KEY_PLAYLISTS = '@tressbit_custom_playlists';

export default function AddToPlaylistModal({ visible, track, onClose }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (visible) {
      loadPlaylists();
    }
  }, [visible]);

  const loadPlaylists = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (stored) {
        setPlaylists(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addTrackToSelectedPlaylist = async (playlist) => {
    if (!track) return;

    // Vérifier si le morceau est déjà présent
    const exists = playlist.tracks.some((t) => t.id === track.id || t.uri === track.uri);
    if (exists) {
      Alert.alert('Information', 'Ce morceau est déjà dans cette playlist.');
      onClose();
      return;
    }

    const updatedPlaylist = {
      ...playlist,
      tracks: [track, ...playlist.tracks],
    };

    const updatedPlaylists = playlists.map((p) =>
      p.id === playlist.id ? updatedPlaylist : p
    );

    try {
      await AsyncStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(updatedPlaylists));
      Alert.alert('Succès', `Ajouté à "${playlist.name}" !`);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBody}>
          <View style={styles.header}>
            <Text style={styles.title}>Ajouter à une playlist</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {track && (
            <Text numberOfLines={1} style={styles.trackTarget}>
              Titre : {track.filename?.replace(/\.(mp3|aac|wav|m4a|flac)$/i, '') || track.name}
            </Text>
          )}

          {playlists.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aucune playlist créée pour le moment.</Text>
            </View>
          ) : (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
              renderItem={({ item }) => {
                const genre = PLAYLIST_GENRES[item.genreKey] || PLAYLIST_GENRES.MELODY_RAP;
                return (
                  <TouchableOpacity
                    style={styles.playlistRow}
                    activeOpacity={0.7}
                    onPress={() => addTrackToSelectedPlaylist(item)}
                  >
                    <View style={[styles.iconBox, { borderColor: genre.primary }]}>
                      <Ionicons name={genre.icon} size={20} color={genre.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.playlistName}>{item.name}</Text>
                      <Text style={[styles.genreText, { color: genre.primary }]}>
                        {genre.label} • {item.tracks.length} sons
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color={genre.primary} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalBody: {
    backgroundColor: '#111512',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.2)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  trackTarget: { color: '#00FF66', fontSize: 13, marginTop: 6, marginBottom: 14 },
  emptyBox: { paddingVertical: 30, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 14 },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistName: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  genreText: { fontSize: 12, marginTop: 2 },
});