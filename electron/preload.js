const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('teensyAPI', {
  uploadTeensy: (code, board) => ipcRenderer.invoke('upload-teensy', { code, board }),
  compileSketch: (code, board) => ipcRenderer.invoke('compile-sketch', { code, board }),
});
