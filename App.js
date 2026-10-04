import React, { useState, useContext } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { FavoritesProvider } from './src/contexts/FavoritesContext';
import { AudioProvider, AudioContext } from './src/contexts/AudioContext';

import WelcomeCarouselScreen from './src/screens/WelcomeCarouselScreen';
import HomeScreen from './src/screens/HomeScreen';
import DeviceMusicScreen from './src/screens/DeviceMusicScreen';
import PlaylistScreen from './src/screens/PlaylistScreen';
import PlaylistDetailScreen from './src/screens/PlaylistDetailScreen';
import AddSongsToPlaylistScreen from './src/screens/AddSongsToPlaylistScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import RecentMusicScreen from './src/screens/RecentMusicScreen';
import SoftPlayerScreen from './src/screens/SoftPlayerScreen';
import { PLAYLIST_THEMES } from './src/utils/themes';

function MainNavigator() {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const { playTrack, currentTheme } = useContext(AudioContext);

  if (!hasStarted) {
    return <WelcomeCarouselScreen onFinish={() => setHasStarted(true)} />;
  }

  // LECTEUR DOUX BI-MODE (CADRE 1 & CADRE 2)
  if (currentScreen === 'player') {
    return (
      <SoftPlayerScreen
        onBack={() => setCurrentScreen('home')}
        playlistTitle={selectedPlaylist?.name || 'Toutes les musiques'}
        customTheme={currentTheme || PLAYLIST_THEMES.LOVE}
      />
    );
  }

  // FAVORIS
  if (currentScreen === 'favorites') {
    return (
      <FavoritesScreen
        onBack={() => setCurrentScreen('home')}
        onPlayTrack={(track, list) => {
          playTrack(track, list, PLAYLIST_THEMES.LOVE);
          setCurrentScreen('player');
        }}
      />
    );
  }

  // RÉCENTS
  if (currentScreen === 'recents') {
    return (
      <RecentMusicScreen
        onBack={() => setCurrentScreen('home')}
        onSelectTrack={(track, list) => {
          playTrack(track, list, PLAYLIST_THEMES.DANCE);
          setCurrentScreen('player');
        }}
      />
    );
  }

  // AJOUTER SONS DANS PLAYLIST
  if (currentScreen === 'add_songs' && selectedPlaylist) {
    return (
      <AddSongsToPlaylistScreen
        playlist={selectedPlaylist}
        onBack={() => setCurrentScreen('playlist_detail')}
        onUpdated={(up) => setSelectedPlaylist(up)}
      />
    );
  }

  // DÉTAIL D'UNE PLAYLIST
  if (currentScreen === 'playlist_detail' && selectedPlaylist) {
    return (
      <PlaylistDetailScreen
        playlist={selectedPlaylist}
        onBack={() => setCurrentScreen('playlists')}
        onOpenAddSongs={() => setCurrentScreen('add_songs')}
        onPlayTrack={(track, list) => {
          const themeKey = selectedPlaylist.genreKey || 'LOVE';
          playTrack(track, list, PLAYLIST_THEMES[themeKey] || PLAYLIST_THEMES.LOVE);
          setCurrentScreen('player');
        }}
      />
    );
  }

  // SUR L'APPAREIL
  if (currentScreen === 'device') {
    return (
      <DeviceMusicScreen
        onBack={() => setCurrentScreen('home')}
        onSelectTrack={(track, list) => {
          playTrack(track, list, PLAYLIST_THEMES.MELODY_RAP);
          setCurrentScreen('player');
        }}
      />
    );
  }

  // PLAYLISTS
  if (currentScreen === 'playlists') {
    return (
      <PlaylistScreen
        onBack={() => setCurrentScreen('home')}
        onOpenPlaylistDetail={(pl) => {
          setSelectedPlaylist(pl);
          setCurrentScreen('playlist_detail');
        }}
      />
    );
  }

  return (
    <HomeScreen
      onNavigateDevice={() => setCurrentScreen('device')}
      onNavigatePlaylists={() => setCurrentScreen('playlists')}
      onNavigateFavorites={() => setCurrentScreen('favorites')}
      onNavigateRecents={() => setCurrentScreen('recents')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <AudioProvider>
          <MainNavigator />
        </AudioProvider>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
}