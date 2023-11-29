const { GRID_SIZE } = require('./constants');
/**
 * Seccion de exportacion de los modulos necesarios para la ejecucion del juego
 * @param 
 * @returns las funciones necesarias para la ejecucion del juego
 * @restrictions 
 */
module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}
/**
 * Inicia el juego
 * @param ninguno
 * @returns dispara el llamado a las funciones necesarias para que se inicialice la partida
 * @restrictions ninguna
 */
function initGame(gameMode,largoSerpiente,segundos) {
  const state = createGameState(gameMode,largoSerpiente,segundos);
  randomFood(state);
  return state;
}
/**
 * Crea el estado inicial del juego
 * @param ninguno
 * @returns retorna un estao "semilla" del tablero de juego
 * @restrictions ninguna
 */
function createGameState(gameMode,largoSerpiente,segundos) {
  return {
    gameMode: gameMode,
    players: [{
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 1,
        y: 0,
      },
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
      ],
      snakeLength: 3,
    }, {
      pos: {
        x: 18,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 20, y: 10},
        {x: 19, y: 10},
        {x: 18, y: 10},
      ],
      snakeLength: 3,
    }],
    food: {},
    gridsize: GRID_SIZE,
    gameTime: segundos,
    maxSnake:largoSerpiente,
  };
}
function getWinnerByPoints(state){
  if(state.playerOne.snakeLength >= state.maxSnake){return 2;}
  else{return 1;}
}
/**
 * Administra el estado del tablero y realiza las validaciones y modificaciones necesarias para que el juego se ejecute
 * @param estado actual del juego
 * @returns permite que se realicen las interacciones que modifican el estado del juego en cada momento
 * @restrictions no pueden existir dos elementos distintos en el mismo punto del tablero
 */
function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  if (state.gameMode === 'time') {
    state.gameTime--;
    if (state.gameTime =0) {
      return getWinnerByPoints(state);  
    }
  }

  if (state.gameMode === 'length') {
    if (playerOne.snakeLength >= state.maxSnake) {
      return 1;
    }
    if (playerTwo.snakeLength >= state.maxSnake) {
      return 2;
    }
  }

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    playerOne.snakeLength -=1;
    playerOne.snake.pop({ ...playerOne.pos});
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    playerTwo.snakeLength -=1;
    playerTwo.snake.pop({ ...playerTwo.pos});
  }

  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snakeLength += 1;
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
  }

  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snakeLength += 1;
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
  }

  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
}
/**
 * Ubica un punto de "comida" en una ubicacion random del tablero
 * @param el estado actual del tablero
 * @returns ubica un punto de comida en una ubicacion del tablero
 * @restrictions el punto de comida no puede aparecer en una casilla ocupada por un jugador
 */
function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}
/**
 * Funcion para modificar el movimiento de la serpiente del jugador
 * @param el codigo de la tecla precionada por el jugador 
 * @returns modifica el movimiento de la serpiente según la tecla precionada por el jugador
 * @restrictions el codigo recibido debe ser el de una tecla de direcciones
 */
function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: { // left
      return { x: -1, y: 0 };
    }
    case 38: { // down
      return { x: 0, y: -1 };
    }
    case 39: { // right
      return { x: 1, y: 0 };
    }
    case 40: { // up
      return { x: 0, y: 1 };
    }
  }
}
