const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const express = require('express');
const path = require('path');
const io = require('socket.io-client');
const { autoUpdater } = require('electron-updater')
const { dialog } = require('electron');

// Conecta-se ao servidor
const socket = io('http://192.168.5.46:3005');

let mainWindow; // Defina a variável mainWindow aqui

// Criando um servidor Express
const server = express();
const PORT = 3000; // Defina a porta que deseja usar

// Defina as rotas do seu servidor aqui
server.get('/', (req, res) => {
  res.send('Servidor rodando dentro do Electron!');
});

// Inicia o servidor
const expressServer = server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: 'MyZap',
    icon: 'img/picone.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      autoHideMenuBar: true,
      resizable: false, // Para impedir redimensionamento
      maximizable: false, // Para impedir maximização
      transparent: true, // Para tornar a janela transparente
    }
    
  });


  // Carrega diretamente do servidor local
  mainWindow.loadURL(`http://192.168.5.46:${PORT}`).catch(err => {
    console.error('Erro ao carregar a janela:', err);
  });

  // Manipula eventos de fechamento da janela
  mainWindow.on('closed', () => {
    // Encerra o servidor Express quando a janela for fechada
    expressServer.close();
    // Encerra o aplicativo quando todas as janelas forem fechadas (se estiver no macOS)
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
};

app.whenReady().then(() => {
  createWindow();
}).catch(err => {
  console.error('Erro ao iniciar o aplicativo:', err);
});

// Encerra o servidor Express quando todas as janelas forem fechadas (se não estiver no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    expressServer.close();
    app.quit();
  }
});

// Cria uma nova janela quando o aplicativo for ativado (se não houver janelas abertas)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

  // Traga a janela para a frente após um certo tempo
  setTimeout(() => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }, 3000);
