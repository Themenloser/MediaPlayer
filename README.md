# MediaPlayer iOS App

Eine moderne iOS-App für Musik- und Video-Verwaltung mit YouTube-Integration.

## 🚀 Features

- **🎵 Playlist Management** - Lokale Musik mit Favoritenfunktion
- **🔍 YouTube Search** - Videos und Musik suchen und herunterladen
- **📹 Video Library** - Lokale Videoverwaltung
- **⚙️ Settings** - Dark Mode, Logs, Debug-Menü
- **📱 iOS Native UI** - Optimiert für iPhones und iPads

## 🏗️ Architektur

- **Expo Router** mit TypeScript
- **React Context** für State Management
- **Modulare Services** (API, Storage, Logger, Settings)
- **Backend Integration** mit `https://yt-is06.onrender.com`

## 📱 Installation

### Mit GitHub Desktop

1. **Repository klonen:**
   ```bash
   git clone https://github.com/your-username/MediaPlayer.git
   cd MediaPlayer
   ```

2. **Dependencies installieren:**
   ```bash
   npm install
   ```

3. **App starten:**
   ```bash
   npm run start
   ```

4. **Expo Go öffnen** und QR-Code scannen

### IPA Build mit GitHub Actions

Die App wird automatisch als **.ipa** Datei gebaut bei jedem Push auf `main` oder `develop`.

#### Benötigte GitHub Secrets:

1. **EXPO_TOKEN** - Expo Account Token
   - Erstellen: Expo Dashboard → Account → Create Token
   - Hinzufügen: GitHub Repository → Settings → Secrets

2. **SLACK_WEBHOOK_URL** (Optional) - Build-Benachrichtigungen
   - Erstellen: Slack Channel → Apps → Incoming Webhooks

#### Build auslösen:

**Automatisch:**
- Push auf `main` oder `develop` Branch

**Manuell:**
- GitHub Actions Tab → "Build iOS IPA" → "Run workflow"
- Build-Typ wählen: `development` oder `production`

#### IPA herunterladen:

1. GitHub Actions Tab → Build-Workflow
2. "Artifacts" Sektion
3. `ios-ipa-development` oder `ios-ipa-production` herunterladen

## 🔧 Entwicklung

### Lokale Entwicklung

```bash
# Starten
npm run start

# iOS Simulator
npm run ios

# Web (für Tests)
npm run web
```

### Projektstruktur

```
MediaPlayer/
├── app/                    # Expo Router Screens
│   ├── (tabs)/            # Bottom Tabs
│   │   ├── playlist.tsx    # 🎵 Musik-Playlist
│   │   ├── search.tsx      # 🔍 YouTube Suche
│   │   ├── videos.tsx      # 📹 Video-Bibliothek
│   │   └── settings.tsx   # ⚙️ Einstellungen
│   └── _layout.tsx        # Root Layout
├── components/             # UI Komponenten
├── services/              # API & Daten-Services
│   ├── api.ts            # YouTube Backend
│   ├── storage.ts        # Lokaler Speicher
│   ├── logger.ts         # Logging System
│   └── settings.ts      # App Einstellungen
├── store/                # State Management
│   └── AppContext.tsx   # React Context
├── types/                # TypeScript Types
├── utils/                # Helper Funktionen
└── .github/workflows/     # CI/CD Pipelines
```

## 📦 Build Profile

### Development
- **iOS Simulator** für schnelles Testing
- **Hot Reload** und Debugging
- **Keine Apple Developer ID** nötig

### Production
- **Tatsächliches .ipa** für iPhones
- **Apple Developer ID** erforderlich
- **App Store oder Ad-Hoc Distribution**

## 🔐 Backend Integration

Die App nutzt das YouTube Backend:
- **API:** `https://yt-is06.onrender.com`
- **GitHub:** https://github.com/Themenloser/Yt

### API Endpoints:
- `GET /` - Backend Status
- `POST /info` - Video Informationen
- `POST /download/video` - Video Download
- `POST /download/audio` - Audio Download
- `GET /file/{filename}` - Datei Download

## 🎯 Nächste Schritte

1. **GitHub Repository erstellen**
2. **EXPO_TOKEN Secret hinzufügen**
3. **Push zu GitHub** → Automatischer Build
4. **IPA aus Artifacts herunterladen**

## 📱 App Features

### 🎵 Playlist
- Lieblingssongs oben angepinnt
- Lokale Musikbibliothek
- Metadaten (Titel, Künstler, Album)
- Favoritenfunktion

### 🔍 Search
- YouTube durchsuchen
- Video-Vorschau mit Thumbnails
- Download als Audio (MP3) oder Video
- Backend-Integration

### 📹 Videos
- Lokale Video-Bibliothek
- Video-Informationen und Metadaten
- Löschen und Verwalten
- Gruppiert nach Datum

### ⚙️ Settings
- Dark Mode (System/Licht/Dunkel)
- App-Logs ansehen und exportieren
- Cache leeren
- Debug-Menü mit technischen Infos
- Backend-Status prüfen

---

**Entwickelt mit ❤️ für iOS**
