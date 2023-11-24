const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const { createGameState,gameLoop,getUpdatedVelocity} = require('./game');
const { FRAME_RATE } = require('./constants');

const state= {};
const clientRooms={};

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*", // o el origen correcto de tu cliente
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling']
  }
});

// Configurar CORS
app.use(cors({ credentials: true }));

// Middleware para agregar el encabezado Content-Security-Policy

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'default-src \'self\'');
  //res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', 'localhost');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

io.on('connection', client => {

  client.on('keydown',handleKeydown);
  client.on('newGame',handleNewGame);
  
  function handleNewGame(){
    let roomName=makeid(5);
    clientRooms[client.id]=roomName;
    client.emit('gameCode'.roomName);

    state[roomName]=initGame();
    client.join(roomName);
    client.number=1;
    client.emit('init',1);

  }

  function handleKeydown(keyCode){
    try{
      keyCode=parseInt(keyCode);
    }catch(e){
      console.error(e);
      return;
    }

    const vel=getUpdatedVelocity(keyCode);

    if(vel){
      state.player.vel=vel;
    }

  }

  startGameInterval(client,state);
});

function startGameInterval(client,state){
  const intervalId=setInterval(()=>{
    const winner=gameLoop(state);



    if(!winner){
      client.emit('gameState',JSON.stringify(state))
    }else{
      client.emit('gameOver');
      clearInterval(intervalId);
    }

  },1000/FRAME_RATE)

}

const directorioPadre = path.join(__dirname, '..');

// Construir la ruta completa al directorio 'frontend'
const frontendPath = path.join(directorioPadre, 'frontend');

// Servir archivos estáticos desde la carpeta 'frontend'
app.use(express.static(frontendPath));

// Ruta de inicio, sirve el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = 4500;
server.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});

io.listen(4501);