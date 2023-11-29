const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};
/**
 * Dispara los eventos que se deben ejecutar al inicial el juego
 * @param el evento de coneccion de un cliente con la aplicacion del servidor
 * @returns dispara los eventos de creacion de partida, union a una partida, precion de teclas
 * @restrictions debe conectarse un cliente para iniciar los eventos trigger
 */
io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('newTimeGame', handleNewTimeGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
  }
  /**
  * Dispara las funciones para el inicio del juego
  * @param niguno
  * @returns crea un identificador de juego, crea la sala de juego y permite a los jugadores que lo deseen unirse
  * @restrictions el juego iniciado debe tener un codigo valido
  */
  function handleNewTimeGame(tiempoSegundos) {
    let roomName = makeid(5);

    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame('time',0,tiempoSegundos);

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }


  function handleNewGame(largoSerpiente) {
    let roomName = makeid(5);

    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame('length',largoSerpiente,0);

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }
  /**
  * Maneja los eventos de precion de teclas de los jugadores
  * @param codigo de la tecla precionada 
  * @returns modifica el movimiento de la serpiente según la tecla precionada por el jugador
  * @restrictions el codigo recibido debe ser el de una tecla de direcciones
  */
  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});
/**
* crea el tablero y el juego 
* @param el codigo de la partida a iniciarse
* @returns crea la sala para la partida
* @restrictions el codigo recibido debe ser el de una sala valida
*/
function startGameInterval(roomName) {
  const intervalId = setInterval(() => {

    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}
/**
* envia a los jugadores el codigo de la partida creada
* @param el codigo de la sala de juego y el estado del juego en dicha sala
* @returns muestra a los jugadores la sala indicada
* @restrictions el codigo recibido debe ser el de una partida valida
*/
function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}
/**
* avisa el omento en que un jugador haya ganado
* @param el codigo de la sala de juego y el jugador ganador
* @returns muestra a los jugadores la sala indicada el ganador de la partida
* @restrictions el codigo recibido debe ser el de una partida valida
*/
function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}
/**
* setea el puerto 3000 para la escucha de mensajes
* @param el numero del puerto
* @returns pone el puerto indicado en escucha del socket
* @restrictions el puerto indicado debe estar disponible
*/
io.listen(process.env.PORT || 3000);
