const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 메모리 내에 사용자와 메시지를 저장
let users = {};
let messages = [];

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로에서 index.html 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io 연결
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 새 유저 로그인 처리
  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('userList', Object.values(users)); // 사용자 목록 갱신
  });

  // 메시지 수신 및 저장
  socket.on('chatMessage', (message) => {
    const userMessage = {
      user: users[socket.id],
      message,
      timestamp: new Date().toISOString(),
    };
    messages.push(userMessage);
    io.emit('chatMessage', userMessage);
  });

  // 연결 해제 시 사용자 제거
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('userList', Object.values(users)); // 사용자 목록 갱신
  });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
