const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const bodyparser = require('body-parser');

const cool = require('cool-ascii-faces');

//Initialization ---------------------------
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/cool', (req, res) => res.send(cool()));

// settings ---------------------------
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main', 
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir:path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

// Middleware ---------------------------
app.use(bodyparser.json());

io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('load', (data) => {
    console.log(data.key);
    if (data.key == "Dilian") {
      io.emit('access', "granted");
    } else {
      io.emit('access', "nope");
    }
  });

  // cuando cambio un slide
  socket.on('slide-changed', (data) =>{
    console.log("slide changed / data = ", data);
    io.emit('navigate', data);
  });

  // cuando interactuan con videos
  socket.on('play', (data) => {
    console.log("video play / data = ", data);
    
    // cambiando video de los clientes
    io.emit("command", data);
  });

  // para las votaciones
  socket.on('turnVotation', (data) => {
    console.log("votacion 1 / data = ", data);

    // activando votacion
    io.emit("enableVotation", data);
  });
  socket.on('turnVotation2', (data) => {
    console.log("votacion 2 / data = ", data);

    // activando votacion
    io.emit("enableVotation2", data);
  });

  // para las votaciones
  socket.on('ideaRecieved', (data) => {
    console.log("idea recibida / data = ", data);
    //ideas
    io.emit("newIdea", data);
  });

  socket.on('ideaVoted', (data) => {
    console.log("idea votada / data = ", data);
    // enviando votos
    io.emit("voteRecieved", data);
  });

  // para los emails
  socket.on('sendMail', (data) =>{
    console.log("enviar correo / data = ", data);

    let sql = 'SELECT * FROM `test_table`';
    connection.query(sql, (error, result) =>{
      if(error) throw error;
      if(result.length > 0){
        console.log('result = ',result);
      }else{
        console.log('Not result');
      }
    })
  });

});// on connection end


// Database ---------------------------
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'presentacion-interactiva'
});

connection.connect( error => {
  if (error) throw error;
  console.log('Database server running');
});

// Global vars  ---------------------------

// Routes  ---------------------------
app.use( require('./routes/index') );

// Static Files  ---------------------------
app.use(express.static( path.join(__dirname, 'public') ));

// Server listening  ---------------------------
http.listen(app.get('port'), () =>{
console.log( 'Server on port', app.get('port') );
});