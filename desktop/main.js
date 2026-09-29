// Songbook Studio als Desktop-Programm (Electron): zeigt Studio und Songbook in einem eigenen Fenster
const { app, BrowserWindow, dialog, nativeTheme, net, protocol, session, shell, systemPreferences } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = path.join(__dirname, ".."); // Ordner mit index.html und studio.html
const ORIGIN = "app://songbook";
const ALLOWED = new Set(["media", "midi", "midiSysex"]); // Mikrofon/Audio-Interface und Web-MIDI (Chromium fragt MIDI als „midiSysex“ an)

// Eigenes Protokoll statt file:// – feste Herkunft für die gespeicherten Projekte (IndexedDB)
// und ein sicherer Kontext, den Mikrofon und MIDI voraussetzen
protocol.registerSchemesAsPrivileged([{ scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);

function serveFiles() {
  protocol.handle("app", async req => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url).pathname));
    if (!file.startsWith(ROOT + path.sep)) return new Response("", { status: 403 });
    try { return await net.fetch(pathToFileURL(file).toString()); }
    catch { return new Response("", { status: 404 }); }
  });
}

function allowPermissions() {
  const ses = session.defaultSession;
  ses.setPermissionCheckHandler((wc, perm, origin) => ALLOWED.has(perm) && String(origin).startsWith(ORIGIN));
  ses.setPermissionRequestHandler(async (wc, perm, done, details) => {
    if (!ALLOWED.has(perm) || !String(details.requestingUrl).startsWith(ORIGIN + "/")) return done(false);
    if (perm === "media") {
      if ((details.mediaTypes || []).includes("video")) return done(false); // nur Audio
      if (process.platform === "darwin") return done(await systemPreferences.askForMediaAccess("microphone"));
    }
    done(true);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 380, minHeight: 560,
    title: "Songbook Studio",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#141318" : "#f6f5f2",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false,
      backgroundThrottling: false, // Metronom und MIDI-Clock laufen weiter, wenn die DAW im Vordergrund ist
      autoplayPolicy: "no-user-gesture-required" // Start per MIDI von der DAW ohne Klick ins Fenster
    }
  });
  win.loadURL(ORIGIN + "/studio.html");

  // Links ins Internet (z. B. Ultimate Guitar) im Standard-Browser öffnen
  const external = url => { if (/^https?:\/\//.test(url)) shell.openExternal(url); };
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith(ORIGIN + "/")) { e.preventDefault(); external(url); } });

  // Das Studio blockiert das Schließen während einer Aufnahme – dann nachfragen
  win.webContents.on("will-prevent-unload", e => {
    const choice = dialog.showMessageBoxSync(win, {
      type: "question", title: "Songbook Studio", buttons: ["Weiter aufnehmen", "Aufnahme verwerfen"], defaultId: 0, cancelId: 0,
      message: "Es läuft gerade eine Aufnahme.", detail: "Wenn du jetzt schließt oder die Seite wechselst, geht die laufende Aufnahme verloren."
    });
    if (choice === 1) e.preventDefault();
  });
}

if (!app.requestSingleInstanceLock()) app.quit(); // nur ein Fenster, sonst streiten sich zwei um dieselben Projekte
else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
  app.whenReady().then(() => {
    serveFiles(); allowPermissions(); createWindow();
    app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  });
  app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
}
