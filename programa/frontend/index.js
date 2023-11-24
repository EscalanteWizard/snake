const BG_COLOUR = 'black';
const SNAKE_COLOUR = 'white';
const FOOD_COLOUR = 'red';

const socket = io('*', { withCredentials: true });

socket.on('init',handleInit);
socket.on('gameState',handleGameState);
socket.on('gameOver',handleGameOver);

const gameScreen = document.getElementById('gameScreen');
let canvas, ctx;

function init(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 400;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    
    document.addEventListener('keydown', keydown);

}

function keydown(e){
    console.log(e.keyCode);
    socket.emit('keydown',e.keyCode);
}

init();

function paintGame(state){
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(food.x * size, food.y * size,size,size);

    paintPlayer(state.player,size,SNAKE_COLOUR);
}

function paintPlayer(playerState,size,colour){
    const snake = playerState.snake;

    ctx.fillStyle = colour;
    for(let cell of snake){
        ctx.fillRect(cell.x * size,cell.y * size,size,size);
    }
}

paintGame(gametate);

function handleInit(msg){
    console.log(msg);
};

function handleGameState(gameState){
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
};

function handleGameOver(){
    alert("You lose!!");
}