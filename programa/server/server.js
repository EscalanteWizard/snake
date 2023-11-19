const io = require('socket.io')({
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });

io.on('connection', client => {
    client.emit('init',{data: 'hello world'});
});

io.listen(3000);

