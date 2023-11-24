const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar CORS
app.use(cors());

// Middleware para agregar el encabezado Content-Security-Policy

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 'default-src *');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});



io.on('connection', client => {
  client.emit('init', { data: 'hello world' });
});

// Construir la ruta completa al directorio 'frontend'
const frontendPath = 'D:/WockSpace/Lenguajes2023/PP4_JordanoEscalante/snake/programa/frontend'

// Servir archivos estáticos desde la carpeta 'frontend'
app.use(express.static(frontendPath));

// Ruta de inicio, sirve el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = 4343;
server.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
