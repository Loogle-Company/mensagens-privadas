const express = require('express');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path'); // Importe o módulo path

// Inicialização do Express e do servidor HTTP
const app = express();
const server = http.createServer(app);

// Inicialização do Socket.io
const io = socketIo(server);

// Configuração do banco de dados SQLite
const dbFilePath = 'C:/Users/carto/Desktop/myzap-main/teste/mensagens.db';
console.log(`Caminho do Banco de Dados: ${dbFilePath}`);
const db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Erro ao ler o arquivo do banco de dados:', err);
        return;
      }
      console.log('Arquivo do banco de dados lido com sucesso.');
});


// Criação das tabelas se não existirem
db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read INTEGER DEFAULT 0 -- 0 para não lida, 1 para lida
)`, (err) => {
    if (err) {
        console.error('Erro ao verificar/criar a tabela `notifications`:', err.message);
    } else {
        console.log('Tabela `notifications` verificada/encontrada com sucesso.');
    }
});

// Criação da tabela messages
db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    read INTEGER DEFAULT 0 -- 0 para não lida, 1 para lida
)`, (err) => {
    if (err) {
        console.error('Erro ao verificar/criar a tabela `messages`:', err.message);
    } else {
        console.log('Tabela `messages` verificada/encontrada com sucesso.');
    }
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Estrutura para manter o estado dos usuários e sockets
let userSockets = {};
let usersOnline = {};

// Lógica de conexão do Socket.io
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');
    let currentUser = '';

    socket.on('join', (username) => {
        currentUser = username;
        userSockets[username] = socket.id;
        usersOnline[username] = true;
        console.log(`${username} entrou no chat`);

        // Emitir o status de todos os usuários para o usuário que acabou de se conectar
        socket.emit('all users status', { usersOnline: Object.keys(usersOnline) });
        // Informar aos outros usuários que este usuário está agora online
        socket.broadcast.emit('user status', { username, status: 'online' });

        // Recuperar notificações não lidas para o usuário
        db.all(`SELECT * FROM notifications WHERE recipient = ? AND read = 0`, [username], (err, rows) => {
            if (err) {
                console.error('Erro ao recuperar notificações:', err.message);
                return;
            }

            // Se houver notificações não lidas, envie-as para o usuário
            if (rows.length > 0) {
                rows.forEach(notification => {
                    io.to(userSockets[username]).emit('nova notificação', notification);

                    // Marcar notificação como lida
                    db.run(`UPDATE notifications SET read = 1 WHERE id = ?`, [notification.id], (err) => {
                        if (err) {
                            console.error('Erro ao marcar notificação como lida:', err.message);
                        }
                    });
                });
            }
        });
    });

    socket.on('request old messages', (data) => {
        const { currentUser, otherUser } = data;
        const query = "SELECT * FROM messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) ORDER BY timestamp DESC";
        db.all(query, [currentUser, otherUser, otherUser, currentUser], (err, rows) => {
            if (err) {
                console.error('Erro ao buscar mensagens antigas:', err.message);
                return;
            }
            io.to(socket.id).emit('old messages', { messages: rows, currentUser, otherUser });
        });
    });
  
        // Rota para enviar o sinal de recarga para todos os clientes
    app.post('/reload-apps', (req, res) => {
        io.emit('reload-app');
        res.status(200).send('Reload signal sent to all apps');
      });
    
      socket.on('mark notification read', (data) => {
        db.run(`UPDATE notifications SET read = 1 WHERE id = ?`, [data.id], (err) => {
            if (err) {
                console.error('Erro ao marcar notificação como lida:', err.message);
            }
        });
    });
     

// Configuração de escutas de eventos de socket para comunicação em tempo real
socket.on('mensagem enviada', (data) => {
    console.log('Mensagem:', data);

    // Insere a mensagem no banco de dados
    db.run(`INSERT INTO messages (sender, recipient, message) VALUES (?, ?, ?)`, 
           [data.username, data.to, data.message], (err) => {
        if (err) {
            console.error('Erro ao salvar mensagem:', err.message);
            return;
        }
        console.log('Mensagem salva no banco de dados');

        // Verifica se o destinatário está online
        const recipientSocketId = userSockets[data.to];
        if (recipientSocketId) {
            // Envia a mensagem diretamente se o destinatário estiver online
            io.to(recipientSocketId).emit('mensagem enviada', data);
        } else {
            // Salva uma notificação se o destinatário estiver offline
            db.run(`INSERT INTO notifications (recipient, sender, message) VALUES (?, ?, ?)`, 
                   [data.to, data.username, data.message], (err) => {
                if (err) {
                    console.error('Erro ao salvar notificação:', err.message);
                } else {
                    console.log(`Notificação salva para ${data.to}`);
                }
            });
        }
    });
});


socket.on('disconnect', () => {
    if (currentUser) {
        console.log(`${currentUser} desconectou-se.`);
        // Limpa o usuário das listas de controle
        delete userSockets[currentUser];
        delete usersOnline[currentUser];

        // Notifica os usuários sobre o status offline do usuário desconectado
        io.emit('user status', { username: currentUser, status: 'offline' });
    }
}); 
});


/* Socket irá aqui depois */
var emitir = function(req, res, next){
    var notificar = req.query.notificacao || '';
      if(notificar != '')	 {
      io.emit('notificacao', notificar);
      next();
    } else {
        next();
      }
    }

    
// Rota para visualizar todas as notificações
app.get('/notifications', (req, res) => {
    db.all("SELECT * FROM notifications", [], (err, rows) => {
        if (err) {
            res.status(500).send({error: err.message});
            return;
        }
        res.json(rows);
    });
});

// Rota para visualizar todas as mensagens
app.get('/messages', (req, res) => {
    db.all("SELECT * FROM messages", [], (err, rows) => {
        if (err) {
            res.status(500).send({error: err.message});
            return;
        }
        res.json(rows);
    });
});

// Inicialização e configuração do servidor
const IP = '0.0.0.0';
const PORT = process.env.PORT || 3000;
server.listen(PORT, IP, () => {
    console.log(`Servidor rodando em http://${IP}:${PORT}`);
});