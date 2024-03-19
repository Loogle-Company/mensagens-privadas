
// Aguarda o carregamento completo do DOM para iniciar o script
document.addEventListener('DOMContentLoaded', function () {
    // Conecta ao WebSocket usando a biblioteca Socket.io
    const socket = io();
    // Seleciona o campo de input de mensagem
    const messageInput = document.getElementById('message-input');
    // Seleciona o botão de enviar mensagem
    const sendMessageButton = document.getElementById('send-message');
    const userButtons = document.querySelectorAll('.user-button');
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const inputFile = document.getElementById('file-input');
    const openBtn = document.getElementById("openPopupBtn");
    const closeBtn = document.getElementById("closePopupBtn");
    const popup = document.getElementById("popupContainer");

    inputFile.addEventListener('change', uploadFile);

    openBtn.addEventListener("click", function() {
        popup.style.display = "block";
    });
    
    closeBtn.addEventListener("click", function() {
        popup.style.display = "none";
    });
    
    window.addEventListener("click", function(event) {
        if (event.target === popup) {
            popup.style.display = "none";
        }
    });
    
    // Variável para armazenar o usuário ativo (destinatário das mensagens)
    let activeUser = '';
    // Variável para armazenar o nome de usuário após o login
    let username;

    // Chama a função para configurar todos os ouvintes de evento
    setupEventListeners();

    // Define os ouvintes de eventos para o formulário de login e sockets
    function setupEventListeners() {
        // Adiciona um ouvinte de evento de submissão ao formulário de login
        loginForm.addEventListener('submit', handleLoginFormSubmit);
        // Configura ouvinte para atualizações de status do usuário via socket
        socket.on('user status', updateUserStatus);
        // Configura ouvinte para receber a lista de todos os usuários online via socket
        socket.on('all users status', updateAllUsersStatus);
    }

    // Manipula a submissão do formulário de login
    function handleLoginFormSubmit(event) {
        // Previne o comportamento padrão de submissão do formulário (recarregar a página)
        event.preventDefault();
        // Obtém o nome de usuário do campo de input e armazena na variável username
        username = document.getElementById('username').value;
        var password = document.getElementById('senha').value;
        // Lista de nomes válidos

// Lista de usuários com nomes e senhas correspondentes
        var usuarios = {
            'Ana':  '1478',    
            'Tiago': 'flores'  ,
            'Jéssica': 'jd9905'  ,
            'Elizabeti': '3027'  ,
            'Maria': 'Ma0505'  ,
            'Adriana': '1234'  ,
            'Carolina': 'cajama12@'  ,
            'Miguel': '123@'  ,
            'Izabeli': '1234'  ,
            'Amanda': '1234'  ,
            'Anac': '1234'  ,
            'Fabiana': '110605*' ,
            'Angelo': '1234'  ,
            'Horrana': '1234'  ,
            'Renata': '1234'  ,
            'Venicius': '852456'  ,
            'Camilaq': '1234'  ,
            'Fernanda': 'Fernand@123'  ,
            'Thais': '1234'  ,
            'Grazieli': '290796'  ,
            'Katia': '0310'  ,
            'Andressa': '180425'  ,
            'Andreia': '1234'  ,
            'Leticia': '1234'  ,
            'Larissa': '1234'  ,
            'Janaina': '1507'  ,
            'Camilaf': '1234'  ,
            'Sirlene': '1824Sir'  ,
            'Anaelen': '5039'  ,
            'Michele': '1234'  ,
            'Kethelin': '1234'  ,
            'Marilize': '1234'  ,
            'Franciele': '1234'  ,
            'Esquerda': '1234'  ,
            'Direita' : '1254'  ,
            'Renan' : '1234'  ,
            // ... adicione outros usuários com seus respectivos nomes e senhas
        };
        
        // Verifica se o username foi fornecido e está na lista de nomes
        if (username && usuarios[username] === password) {
            // Esconde o contêiner do formulário de login
            loginContainer.style.display = 'none';
            // Emite um evento 'join' via socket, passando o nome de usuário para o servidor
            socket.emit('join', username);
        }
    }


    // Atualiza o status de um usuário específico baseado nos dados recebidos via socket
    function updateUserStatus(data) {
        // Seleciona o botão do usuário baseado no nome de usuário recebido
        const userButton = document.getElementById(data.username);
        // Verifica se o botão existe
        if (userButton) {
            // Atualiza o fundo e a cor do texto do botão com base no status online
            userButton.style.background = data.status === 'online' ? '#00c77b' : 'none';
            userButton.style.color = data.status === 'online' ? '#ffffff' : 'none';
        }
    }

    // Atualiza o status de todos os usuários com base nos dados recebidos via socket
    function updateAllUsersStatus(data) {
        // Extrai a lista de usuários online dos dados recebidos
        const { usersOnline } = data;
        // Remove o destaque de todos os botões de usuário
        userButtons.forEach(button => button.style.border = 'block');
        // Destaca os usuários que estão online
        usersOnline.forEach(username => highlightUserOnline(username));
    }

    // Destaca um usuário como online baseado no seu nome de usuário
    function highlightUserOnline(username) {
        // Seleciona o botão do usuário baseado no nome de usuário
        const userButton = document.getElementById(username);
        // Se o botão existe, atualiza seu estilo para destacá-lo como online
        if (userButton) {
            userButton.style.background = '#00c77b';
            userButton.style.color = '#ffffff';
        }
    }

    // Função para rolar a área de mensagens até o final
    function scrollToBottom() {
        // Seleciona a área de mensagens
        const messageArea = document.querySelector('.message-area');
        // Se a área de mensagens existe, ajusta o scroll para mostrar a última mensagem
        if (messageArea) {
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    }

    // Define o status da conversa, mostrando com quem o usuário está conversando
    function setConversationStatus(user) {
        // Seleciona o elemento que mostra o status da conversa
        const conversationStatus = document.getElementById('conversation-status');

        // Atualiza o texto do status da conversa
        conversationStatus.textContent = user ? `${user}` : '';


    }

  // Função para alternar entre as caixas de chat com base no usuário selecionado
function changeChatBox(user) {

    // Esconde todas as caixas de chat
    document.querySelectorAll('.chat-box').forEach(box => {
        box.style.display = 'none';
    });

    // Esconde todos os elementos com a classe .imagem
    document.querySelectorAll('.imagem').forEach(imagem => {
        imagem.style.display = 'none';
    });


    // Mostra a caixa de chat do usuário selecionado
    const selectedChatBox = document.getElementById(`${user}-chat-box`);
    if (selectedChatBox) {
        selectedChatBox.style.display = 'block';
        activeUser = user; // Atualiza o usuário ativo na conversa
        openChatWithUser(username, user); // Abre o chat com o usuário selecionado
        setConversationStatus(user); // Atualiza o status da conversa no topo da interface
   
        // Remove a indicação de nova mensagem no botão do usuário, se houver
        const userButton = document.getElementById(user);
        if (userButton) {
            userButton.classList.remove('has-message');
        }


        // Rola a área de mensagens para o final para mostrar as mensagens mais recentes
    }
}

// Configura o evento de clique para cada botão de usuário
userButtons.forEach(button => {
    button.addEventListener('click', function() {
        changeChatBox(button.id); // Chama a função changeChatBox com o ID do botão, que é o nome de usuário
    });
});

// Configura o ouvinte para mensagens antigas recebidas via socket
socket.on('old messages', function (data) {
    const { messages } = data;
    // Para cada mensagem recebida, exibe-a na interface do usuário
    messages.forEach(message => {
        displayMessage(message.message, message.sender, message.recipient, true);
        scrollToBottom();
    });
});

// Adiciona um ouvinte de evento de clique ao botão de enviar mensagem
sendMessageButton.addEventListener('click', function () {
    const message = messageInput.value.trim(); // Remove espaços em branco do início e do fim
    if (message && activeUser) { // Verifica se há uma mensagem e um usuário ativo selecionado
        // Emite a mensagem via socket para o servidor com detalhes do remetente e destinatário
        socket.emit('mensagem enviada', { message, username, to: activeUser });
        displayMessage(message, username, activeUser); // Exibe a mensagem na interface do usuário
        messageInput.value = ''; // Limpa o campo de entrada de mensagem
        
        // Notifica o usuário após o envio da mensagem
        if (Notification.permission === "granted") {
            new Notification("Mensagem enviada com sucesso!");
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    new Notification("Mensagem enviada com sucesso!");
                }
            });
        }
    }
});

// Adiciona um ouvinte de evento de pressionamento de tecla ao campo de entrada de mensagem
messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) { // Verifica se a tecla Enter foi pressionada sem a Shift
        event.preventDefault(); // Previne a inserção de uma nova linha no campo de entrada
        sendMessageButton.click(); // Simula um clique no botão de enviar mensagem
    }
});


// Função para exibir notificações de novas mensagens
function showNotification(fromUser, notificationId) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = `${fromUser} enviou uma mensagem`;
    container.appendChild(notification);

    notification.addEventListener('click', () => {
        changeChatBox(fromUser); 
        container.removeChild(notification);
        markNotificationAsRead(notificationId);
        scrollToBottom();
    });
}

// Manipulador para mensagens de chat
socket.on('mensagem enviada', function (data) {
    if (data.to === username) {
        displayMessage(data.message, data.username, data.to);
        if (data.username !== activeUser) {
            const notificationMessage = `${data.username} enviou uma mensagem`;
            showBrowserNotification(notificationMessage);
            showNotification(data.username, data.notificationId);
        }
    }
});

// Manipulador para novas notificações recebidas
socket.on('nova notificação', function (notification) {
    const notificationMessage = `${notification.sender} enviou uma mensagem`;
    showBrowserNotification(notificationMessage);
    showNotification(notification.sender, notification.id);
});

function markNotificationAsRead(notificationId) {
    socket.emit('mark notification read', { id: notificationId });
}



// Mantém um registro dos usuários cujas mensagens foram carregadas
let loadedUsers = new Set();

// Função para abrir o chat com um usuário e carregar mensagens antigas se necessário
function openChatWithUser(currentUser, otherUser) {
    // Verifica se as mensagens com o outro usuário já foram carregadas
    if (!loadedUsers.has(otherUser)) {
        // Solicita as mensagens antigas ao servidor se não foram carregadas
        socket.emit('request old messages', { currentUser, otherUser });
        loadedUsers.add(otherUser); // Marca as mensagens como carregadas
    } else {
        // Se as mensagens já estiverem carregadas, rola para a última mensagem
        scrollToLastMessage(otherUser);
    }
}


// Função auxiliar para rolar para a última mensagem no chat box
function scrollToLastMessage(otherUser) {
    const chatBox = document.getElementById(`${otherUser}-chat-box`);
    if (chatBox) {
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 100); // Um breve delay para assegurar que o DOM foi atualizado
    }
}

// Adiciona eventos de clique nos botões de usuário para abrir o chat correspondente
userButtons.forEach(button => {
    button.addEventListener('click', function() {
        changeChatBox(button.id);
        openChatWithUser(username, button.id); // Também tenta carregar mensagens antigas se necessário
        scrollToBottom();
    });
});


// Função para exibir mensagens no chat
function displayMessage(message, sender, recipient, prepend = false) {
    // Determina o ID da caixa de chat com base no remetente e no destinatário
    let targetChatBoxId = sender === username ? `${recipient}-chat-box` : `${sender}-chat-box`;
    const targetChatBox = document.getElementById(targetChatBoxId);

    if (targetChatBox) {
        // Cria o elemento da mensagem e adiciona as classes apropriadas
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.classList.add(sender === username ? 'sent-message' : 'received-message');

        // Cria e configura o elemento do remetente
        const senderElement = document.createElement('span');
        senderElement.className = 'sender';
        senderElement.textContent = sender;

        // Cria e configura o elemento de texto da mensagem
        const messageTextElement = document.createElement('span');
        messageTextElement.className = 'message-text';
        messageTextElement.textContent = message;

        // Monta o elemento da mensagem e o adiciona à caixa de chat
        messageElement.append(senderElement, messageTextElement);
        prepend ? targetChatBox.prepend(messageElement) : targetChatBox.appendChild(messageElement);
        scrollToBottom();
        // Rola para a parte inferior da caixa de chat se não for uma adição no topo
        if (!prepend) {
            targetChatBox.scrollTop = targetChatBox.scrollHeight;
        }
    }
}

});

document.addEventListener('DOMContentLoaded', function() {
    const emojiTrigger = document.querySelector('.emoji-trigger');
    const emojiLibrary = document.querySelector('.emoji-library');
    const messageInput = document.querySelector('.message-input');

    // Simulação de emojis
    const emojis = [
        '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', 
        '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', 
        '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', 
        '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', 
        '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', 
        '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', 
        '☹️', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', 
        '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', 
        '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', 
        '🤬', '🤮', '🤢', '😷', '🤒', '🤕', '🤧', '🥳', 
        '🥺', '🤠', '🥸', '😇', '🤥', '🤫', '🤭', '🧐', 
        '🤓', '😈', '👿', '👹', '👺', '💀', '👻', '👽', 
        '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', 
        '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', 
        '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', 
        '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', 
        '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', 
        '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', 
        '🦶', '👣', '👂', '🦻', '👃', '🧠', '🫀', '🫁', 
        '🦷', '🦴', '👀', '👁', '👅', '👄', '👶', '🧒', 
        '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', 
        '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', 
        '🧏', '🙇', '🤦', '🤷', '👮', '🕵', '💂', '👷', 
        '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', 
        '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', 
        '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', 
        '🧍', '🧎', '🏃', '💃', '🕺', '👯', '🧖', '🧗', 
        '🧘', '🛌', '🧑‍🤝‍🧑', '👭', '👫', '👬', '💏', '💑', 
        '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', 
        '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', 
        '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧', 
        '🧑‍🍼', '👚', '👕', '👖', '🧣', '🧤', '🧥', '🧦', 
        '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', 
        '👛', '👜', '👝', '🎒', '👞', '👟', '🥾', '🥿', 
        '👠', '👡', '🩰', '👢', '👑', '👒', '🎩', '🎓', 
        '🧢', '🪖', '💄', '💍', '💼'
    ];
    

    // Preenchendo a biblioteca de emojis
    emojis.forEach(emoji => {
        const emojiElement = document.createElement('span');
        emojiElement.textContent = emoji;
        emojiElement.style.cursor = 'pointer';
        emojiElement.style.padding = '5px';
        emojiElement.addEventListener('click', function() {
            messageInput.value += emoji;
            emojiLibrary.style.display = 'none';
        });
        emojiLibrary.appendChild(emojiElement);
    });

    emojiTrigger.addEventListener('click', function() {
        emojiLibrary.style.display = emojiLibrary.style.display === 'none' ? 'block' : 'none';
    });
});


// script.js
function uploadFile() {
    const input = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    if (input.files.length > 0) {
        const file = input.files[0];
        fileNameDisplay.textContent = `Enviando arquivo: ${file.name}...`;

        const formData = new FormData();
        formData.append('arquivo', file);

        fetch('http://192.168.5.46:3000/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Falha no envio do arquivo.');
        })
        .then(data => {
            fileNameDisplay.textContent = `Arquivo enviado: ${file.name}`;
            console.log('Sucesso:', data);
        })
        .catch(error => {
            console.error('Erro:', error);
            fileNameDisplay.textContent = 'Erro ao enviar arquivo.';
        });
    }
}

// Exportando uploadFile se necessário usar em outro módulo
export { uploadFile };
