// src/context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_THEMES, STYLE_ACCENTS, MUSIC_STYLES } from '../utils/themes';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [musicStyle, setMusicStyle] = useState(MUSIC_STYLES.DEFAULT);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null); // null = en cours de chargement

  // Clés de stockage local (SharedPreferences)
  const STORAGE_KEY_THEME = '@tressbit_theme_mode';
  const STORAGE_KEY_STYLE = '@tressbit_music_style';
  const STORAGE_KEY_FIRST_LAUNCH = '@tressbit_first_launch';

  // Charger les réglages au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        const storedStyle = await AsyncStorage.getItem(STORAGE_KEY_STYLE);
        const storedFirstLaunch = await AsyncStorage.getItem(STORAGE_KEY_FIRST_LAUNCH);

        if (storedTheme !== null) setIsDarkMode(storedTheme === 'dark');
        if (storedStyle !== null) setMusicStyle(storedStyle);
        // Si null, c'est que l'app vient d'être téléchargée
        setIsFirstLaunch(storedFirstLaunch === null);
      } catch (error) {
        console.error('Erreur chargement réglages:', error);
      }
    };

    loadSettings();
  }, []);

  // Fonction pour changer le mode Sombre / Clair
  const toggleThemeMode = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY_THEME, nextMode ? 'dark' : 'light');
  };

  // Fonction pour appliquer le style musical (Onboarding ou Paramètres)
  const applyMusicStyle = async (style) => {
    setMusicStyle(style);
    await AsyncStorage.setItem(STORAGE_KEY_STYLE, style);
  };

  // Valider et terminer l'Onboarding
  const completeOnboarding = async (selectedStyle) => {
    await applyMusicStyle(selectedStyle);
    await AsyncStorage.setItem(STORAGE_KEY_FIRST_LAUNCH, 'false');
    setIsFirstLaunch(false);
  };

  // Objet de thème calculé accessible partout dans l'application
  const activeTheme = {
    ...(isDarkMode ? BASE_THEMES.dark : BASE_THEMES.light),
    accent: STYLE_ACCENTS[musicStyle] || STYLE_ACCENTS[MUSIC_STYLES.DEFAULT],
    isDarkMode,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        musicStyle,
        isDarkMode,
        isFirstLaunch,
        toggleThemeMode,
        applyMusicStyle,
        completeOnboarding,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};