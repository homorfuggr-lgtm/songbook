# Songbook

Akkorde, Texte und Tabs verwalten – mit eingebautem Aufnahme-Studio und DAW-Anbindung.
Läuft im Browser (auch als installierbare Web-App) oder als Desktop-Programm **Songbook Studio**.

## Studio

- Mehrspur-Aufnahme mit Overdub, Punch-in und Rückgängig
- Metronom, Vorzähler, Tempo und Taktart
- Mixer je Spur: Aufnahme (●), Stumm, Solo, Lautstärke, Panorama, Eingang 1/2/stereo
- Export als Mixdown (WAV), als Einzelspuren mit REAPER-Projekt (ZIP) oder als DAWproject (Bitwig, Studio One, Cubase 14)
- DAW-Sync per MIDI-Clock: Studio als Master oder DAW als Master
- Aus jedem Song im Songbook: „🎙 Aufnehmen“ öffnet ein eigenes Projekt mit dem Songtext

## Desktop-Programm (Windows, macOS, Linux)

Die fertigen Dateien gibt es unter [Releases](https://github.com/homorfuggr-lgtm/songbook/releases):

| System | Datei | Hinweis |
|---|---|---|
| Windows | `Songbook-Studio-Setup-….exe` (Installer) oder `…-portable.exe` (ohne Installation) | Das Programm ist nicht signiert: bei der SmartScreen-Warnung „Weitere Informationen“ → „Trotzdem ausführen“. |
| macOS | `Songbook-Studio-…-mac.dmg` (Intel und Apple Silicon) | Nicht notarisiert: nach der ersten Warnung unter Systemeinstellungen → Datenschutz & Sicherheit → „Trotzdem öffnen“. |
| Linux | `Songbook-Studio-…-linux-x86_64.AppImage` | Datei ausführbar machen und starten. |

Unterschiede zum Browser: eigenes Fenster, Metronom und MIDI-Clock laufen auch weiter, wenn die DAW im Vordergrund ist,
und die DAW kann das Studio per MIDI starten, ohne dass man vorher ins Fenster klicken muss.
Projekte im Programm und im Browser werden getrennt gespeichert.

### Selbst bauen

Voraussetzung: [Node.js](https://nodejs.org) 22 oder neuer.

```sh
npm install
npm start      # Programm starten
npm run dist   # Installer für das eigene Betriebssystem in den Ordner dist/ bauen
```

### Neue Version veröffentlichen

Version in `package.json` erhöhen, committen und einen passenden Tag pushen:

```sh
git tag v1.0.1
git push origin v1.0.1
```

Der Workflow „Desktop-Programm“ baut dann Windows, macOS und Linux und hängt die Dateien an ein neues Release.
Bei jedem Pull Request baut er ebenfalls; die Dateien liegen dann als Artefakte am Workflow-Lauf.
