import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

const STORAGE_KEY_FAVORITES = '@tressbit_favorites';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_FAVORITES);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erreur chargement favoris:', e);
    }
  };

  const isFavorite = (trackId, trackUri) => {
    return favorites.some(
      (item) => (trackId && item.id === trackId) || (trackUri && item.uri === trackUri)
    );
  };

  const toggleFavorite = async (track) => {
    if (!track) return;
    try {
      let updated;
      if (isFavorite(track.id, track.uri)) {
        updated = favorites.filter(
          (item) => item.id !== track.id && item.uri !== track.uri
        );
      } else {
        updated = [track, ...favorites];
      }
      setFavorites(updated);
      await AsyncStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(updated));
    } catch (e) {
      console.error('Erreur bascule favori:', e);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};