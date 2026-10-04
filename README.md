<div align="center">

# 🎧 TressBit
### **A 100% Offline Local Audio Player for Android**
*Crafted with React Native, Expo, and a Soft Pastel Neumorphic Aesthetic.*

[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react-native.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## ✨ About TressBit

**TressBit** is a lightweight, beautifully designed local audio player built specifically for Android users who prefer full ownership of their music library without relying on internet connectivity or streaming subscriptions. 

Featuring a soothing **soft pastel neumorphic design**, dynamic theme gradients based on musical genres, and a cute headphone-wearing ghost mascot, TressBit combines aesthetics with high-performance native audio playback.

---

## 🚀 Key Features

- **100% Offline & Local**: Automatically scans your device's local storage to index audio files longer than 60 seconds.
- **Background Audio & System Lock-Screen Control**: Powered by `expo-audio` with a foreground service enabling continuous playback even when the screen is locked, complete with native media notifications (Play/Pause, Skip, Seek).
- **Dynamic Genre-Based Themes**: Playlists adapt colorways dynamically depending on their vibe:
  -  **Love** (Soft Rose / Peach)
  -  **Calm & Sad** (Misty Blue / Pastel Sky)
  -  **Melody & Rap** (Mint / Sage Green)
  -  **Dance** (Warm Amber / Apricot)
- **Dual-View Navigation**: Seamlessly switch between the immersive full-size player card and the list-view queue controller with mini-controls.
- **Precision Playback**: Smooth touch-based seekbar, 10-second fast-forward / rewind buttons, volume control slider, and loop/shuffle modes (`ALL`, `ONE`, `SHUFFLE`).
- **Custom Playlists & Favorites**: Create custom collections, organize tracks by mood, and manage favorites with persistent local storage (`AsyncStorage`).

---

## 🛠️ Tech Stack

- **Framework**: [React Native](https://react-native.dev/) via [Expo](https://expo.dev/)
- **Audio Engine**: `expo-audio` (Modern native audio player & lockscreen media controls)
- **File Management**: `expo-media-library` (Local device scanning)
- **Persistence**: `@react-native-async-storage/async-storage` (Playlists & Favorites)
- **Styling**: `expo-linear-gradient` & Custom StyleSheet animations

---

## 📦 Project Structure

```text
TressBit/
├── assets/                  # Icons, splash screens, and ghost mascot graphics
├── src/
│   ├── context/             # Global AudioContext & FavoritesContext
│   ├── screens/             # UI Views (HomeScreen, PlayerScreen, PlaylistScreen, etc.)
│   └── utils/               # Color palettes & theme configurations
├── App.js                   # Main application entry and navigator
├── app.json                 # Expo native configuration (permissions & background services)
└── package.json
⚙️ Getting Started & Installation
To run TressBit locally on your machine:

Clone the repository:

Bash
git clone [https://github.com/your-username/TressBit.git](https://github.com/your-username/TressBit.git)
cd TressBit
Install dependencies:

Bash
npm install
Run the development server (Expo):

Bash
npx expo start
Build for Android (Development build required for background audio services):

Bash
eas build --profile development --platform android
📱 Permissions Required
TressBit requests minimal local permissions solely required for offline functionality:

READ_MEDIA_AUDIO / READ_EXTERNAL_STORAGE: To detect and load local music files.

FOREGROUND_SERVICE_MEDIA_PLAYBACK: To ensure music keeps playing when the screen is locked.

POST_NOTIFICATIONS: To display the media playback notification bar.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📄 License
Distributed under the MIT License. See LICENSE for more information.
