# 🚀 MediaPlayer iOS App Setup

## 📋 Vorbereitung für GitHub Actions

### 1. GitHub Repository erstellen

```bash
# Neues Repository auf GitHub erstellen
# Name: MediaPlayer
# Description: iOS Music & Video Player with YouTube Integration
# Visibility: Private oder Public
```

### 2. Projekt zu GitHub hinzufügen

```bash
# In GitHub Desktop:
# File → Add Local Repository → MediaPlayer Ordner wählen
# Publish Repository → GitHub Account wählen
```

### 3. GitHub Secrets konfigurieren

Gehe zu: `GitHub Repository → Settings → Secrets and variables → Actions`

#### EXPO_TOKEN (Benötigt)
1. **Expo Dashboard öffnen:** https://expo.dev
2. **Account → Create Personal Access Token**
3. **Name:** `mediaplayer-github`
4. **Permissions:** `Build`, `Read`
5. **Token kopieren**

6. **GitHub Secret erstellen:**
   - Name: `EXPO_TOKEN`
   - Value: `kopierter Expo Token`

#### SLACK_WEBHOOK_URL (Optional)
1. **Slack Channel → Apps → Incoming Webhooks**
2. **Webhook URL kopieren**
3. **GitHub Secret erstellen:**
   - Name: `SLACK_WEBHOOK_URL`
   - Value: `Slack Webhook URL`

### 4. App.json anpassen

```json
{
  "expo": {
    "owner": "dein-github-username"
  }
}
```

### 5. Push zu GitHub

```bash
# Über GitHub Desktop oder Command Line:
git add .
git commit -m "Add GitHub Actions iOS Build"
git push origin main
```

## 🔨 Build Prozess

### Automatisch
- **Push auf `main`** → Development IPA
- **Push auf `develop`** → Development IPA
- **Pull Request** → Development IPA

### Manuell
1. **GitHub Actions Tab**
2. **"Build iOS IPA" Workflow**
3. **"Run workflow"**
4. **Build-Typ wählen:** `development` oder `production`

## 📱 IPA herunterladen

1. **GitHub Actions Tab** → Build-Workflow
2. **"Artifacts" Sektion**
3. **Download:** `ios-ipa-development` oder `ios-ipa-production`

## 📲 IPA auf iPhone installieren

### Methode 1: Xcode (Entwickler)
1. **Xcode öffnen**
2. **IPA拖入** → Window → Devices and Simulators
3. **iPhone wählen** → "+" Button → IPA auswählen

### Methode 2: AltStore (Nicht-Entwickler)
1. **AltStore installieren:** https://altstore.io/
2. **AltStore öffnen** → "+" Button
3. **IPA auswählen** → Installieren

### Methode 3: TestFlight
1. **TestFlight App** installieren
2. **Invitation Link** öffnen (wenn verfügbar)

## 🔧 Build-Typen

### Development Build
- **iOS Simulator** kompatibel
- **Hot Reload** möglich
- **Keine Apple Developer ID** nötig
- **Nur für Testing**

### Production Build
- **Echtes iPhone** kompatibel
- **Apple Developer ID** erforderlich
- **App Store oder Ad-Hoc Distribution**
- **Für Release**

## 🐛 Fehlerbehebung

### Build fehlgeschlagen
1. **GitHub Actions Log prüfen**
2. **EXPO_TOKEN überprüfen**
3. **app.json Bundle Identifier prüfen**
4. **EAS Konfiguration prüfen**

### IPA nicht ladbar
1. **Apple Developer Account** prüfen
2. **Bundle Identifier** einzigartig?
3. **Provisioning Profile** gültig?

### Expo Login Probleme
```bash
# Lokal testen:
eas login
eas project:info
```

## 📞 Support

- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **GitHub Actions:** https://docs.github.com/en/actions

---

**Fertig! 🎉**
Die App wird jetzt automatisch bei jedem Push als IPA gebaut.
