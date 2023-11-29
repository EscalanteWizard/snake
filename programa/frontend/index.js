const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

/**
* enlace para deploy de la aplicacion frontend
* @param irl para el servicio de deploy frontend
* @returns pone la aplicacion frontend en escucha
* @restrictions debe existir el servicio de hosting
*/

const socket = io('http://localhost:3000', { withCredentials: true });

socket.on('init',handleInit);

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const newTimeGameBtn = document.getElementById('newTimeGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const lengthInput = document.getElementById('snakeLengthInput');
const timeInput = document.getElementById('secondsInput');

newGameBtn.addEventListener('click', newGame);
newTimeGameBtn.addEventListener('click', newTimeGame);
joinGameBtn.addEventListener('click', joinGame);

/**
* Envía al servidor el mensaje de que debe nicializar el juego
* @param ninguno
* @returns llama a la funcion de inicio de juego
* @restrictions ninguna
*/
function newGame() {
  const length = parseInt(lengthInput.value);
  if (!length){length=6}
  socket.emit('newGame',length);
  init();
}
/**
* Envía al servidor el mensaje de que debe nicializar el juego
* @param ninguno
* @returns llama a la funcion de inicio de juego
* @restrictions ninguna
*/
function newTimeGame() {
  const tiempo = parseInt(timeInput.value);
  if(!tiempo){tiempo=60}
  socket.emit('newTimeGame',tiempo);
  init();
}
/**
* Envia al servidor el mensaje de que debe permitir a un jugador unirse a una partida
* @param ninguno
* @returns permite al jugador unirse a la partida
* @restrictions el codigo de la partida debe ser valido
*/
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let playersPoints=[];
let gameActive = false;
/**
* Envia al servidor el mensaje de que debe inicializar los parametros de un juego nuevo
* @param ninguno
* @returns setea los valores iniciales de la partida nueva
* @restrictions ninguna
*/
function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}
/**
* envia al servidor el mensaje de que una tecla se ha precionado
* @param en evento de precion de una tecla
* @returns envia al mensaje al server
* @restrictions el codigo recibido debe ser el de una tecla de direcciones
*/
function keydown(e) {
  socket.emit('keydown', e.keyCode);
}
/**
* envia al servidor el mensaje de que se debe pintar el tablero inicial
* @param el estado del tablero
* @returns envia al mensaje al server
* @restrictions el estado debe validarse
*/
function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, 'red');
}
/**
* envia al servidor el mensaje de que se debe pintar el jugador en pantalla
* @param largo de la serpiente del jugador, el tamaño y su color
* @returns el servidor pinta el jugador en pantalla
* @restrictions el estaod del jugador debe ser valido
*/
function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}
/**
* setea el numero del jugador
* @param numero del jugador
* @returns setea el numero del jugador
* @restrictions el valor recibido debe ser numero
*/
function handleInit(number) {
  playerNumber = number;
}
/**
* Envia el estado del juego al servidor
* @param el estaod del juego en formato JSON
* @returns envia al servidor el estado del juego
* @restrictions el estado debe ser en formato JSON
*/
function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}
/**
* Valida si existe un ganador de la partida
* @param el dato del estado de los jugadores
* @returns verifica si existe un ganador
* @restrictions el estado del juego debe ser en formato JSON
*/
function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}
/**
* Despliega el codigo de la partida
* @param codigo de la partida
* @returns setea el codigo d ela partida
* @restrictions el codigo debe ser valido
*/
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}
/**
* Verifica que el codigo es valido
* @param ninguno
* @returns muestra el mensaje de que el codigo suministrado no es valido
* @restrictions ninguna
*/
function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}
/**
* Verifica el numero de jugadores
* @param ninguna
* @returns muestra un mensaje cuando la partida ya  ah iniciado
* @restrictions ninguna
*/
function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}
/**
* Resetea la partida
* @param ninguno
* @returns setea puntajes, tableros y partidas a su estado inicial
* @restrictions ninguna
*/
function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
