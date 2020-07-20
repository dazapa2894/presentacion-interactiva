const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const apiRouter = require('./routes');
// const mysql = require('mysql');
const bodyparser = require('body-parser');
// unique id creator
const {
  v4: uuidv4
} = require('uuid');


// easter egg :v
const cool = require('cool-ascii-faces');

// for the postgres database
const {
  Pool
} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // ssl: process.env.DATABASE_URL ? true : false
});


//Initialization ---------------------------
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);



// settings ---------------------------
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
app.set('view engine', '.hbs');



// HEROKU TEST
app.get('/cool', (req, res) => res.send(cool()));

app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const session_result = await client.query('SELECT * FROM sessions_info');
    const other_result = await client.query('SELECT * FROM sessions_info');
    const session_results = {
      'row': (session_result) ? session_result.rows : null
    };
    const other_results = {
      'row': (other_result) ? other_result.rows : null
    };
    res.render('db_views/db', {
      showdb: true,
      all_sessions: session_results.row,
      this_session: other_results.row
    });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
})


// Middleware ---------------------------
app.use(bodyparser.json());


// Sockets
let hashActual = '';
let postit_array = {};
let votacion_ideas_activa = false;
let votacion_purpose_activa = false;
let video_array = [];
let session_id = '';

if (session_id == '') {
  session_id = uuidv4();
  console.log(session_id);
}

io.on('connection', (socket) => {

  console.log('a user connected');

  /* 
  llenar variables del servidor que controlen: 
  * el hash actual de la presentacion 
  * el array de objetos que mantiene actualizados a los ususarios
  - el objeto que controla los videos
  
  */

  /* 
  *** NO ES NECESARIO *** 
  socket.on('user_disconnect', () => {
    console.log('user disconnected');
    // eliminar de la lista de usuarios conectados
  });

  socket.on('controler_disconnect', () => {
    console.log('controler disconnected');

    // limpiar variables del servidor
    // sacar a todos los ususrio a la url de 'presentacion terminada' 
  });
  */


  socket.on('reset', (data) => {
    //no envio datos
    hashActual = '';
    postit_array = {};
    votacion_ideas_activa = false;
    votacion_purpose_activa = false;
    video_array = [];
    session_id = '';

    io.emit('navigate', '#/');
    io.emit("refresh_ideas", postit_array);
    io.emit("enableVotation", votacion_ideas_activa);
    io.emit("enableVotation2", votacion_purpose_activa);
    io.emit('reload', "reload");
  });

  socket.on('load', (data) => {
    // console.log(data.key);
    console.log('"', data.user_id, '" se ha conectado...');

    // hacer algo cuando un ususario se logee

    if (data.key == "Dilian") {
      io.emit('access', "granted");
      io.emit('navigate', hashActual);
      io.emit("refresh_ideas", postit_array);
      io.emit("enableVotation", votacion_ideas_activa);
      io.emit("enableVotation2", votacion_purpose_activa);

    } else {
      io.emit('access', "nope");
    }
  });

  // cuando cambio un slide
  socket.on('slide-changed', (data) => {
    console.log("slide changed / data = ", data);

    // actualizo la variable global del hash para que los usuarios nuevos lleguen a donde deberian
    hashActual = data;
    io.emit('navigate', hashActual);


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
    votacion_ideas_activa = data.isActive;
    // activando votacion
    io.emit("enableVotation", data);
  });
  socket.on('turnVotation2', (data) => {
    console.log("votacion 2 / data = ", data);
    votacion_purpose_activa = data.isActive;
    // activando votacion
    io.emit("enableVotation2", data);
  });

  // para las votaciones
  socket.on('ideaRecieved', (data) => {
    console.log("idea recibida / data = ", data);

    // actializo el array de ideas
    postit_array[data.key] = data;
    console.log(postit_array);
    //ideas
    io.emit("refresh_ideas", postit_array);
  });

  socket.on('ideaVoted', (data) => {
    console.log("idea votada / data = ", data);
    // enviando votos
    console.log('ideaVoted...');
    console.log(data);
    console.log(postit_array[data.id]);

    postit_array[data.id].votes = data.num_votes;

    io.emit("refresh_ideas", postit_array);

  });

  // para guardar filas en la BD


  socket.on('save_ideas', (data) => {
    console.log(data);
  });
  socket.on('save_purposes', (data) => {

    let posts = data.posts;

    Object.keys(posts).forEach(key => {
      // console.log(key, posts[key]);
      // console.log(posts[key].post_id);
      // console.log(posts[key].post_text);
      // console.log(posts[key].post_votes);

      try {
        const client = pool.connect();
        //let results = client.query("INSERT INTO unique_id  (post_id, post_text, post_type) values ('test-id', 'test-text', 'test-type')");
        let results = client.query("INSERT INTO unique_id (post_id, post_text, post_type) values ($1, $2, $3)",
          [posts[key].post_id, posts[key].post_text, posts[key].post_votes]);
        client.release();
      } catch (err) {
        console.error(err);
        console.log("Error " + err);
      }

    });

  });

}); // on connection end


// Database ---------------------------
/*
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
*/


// Global vars  ---------------------------

// Routes  ---------------------------
app.use(apiRouter);
app.use('/api/db', apiRouter);

// Static Files  ---------------------------
app.use(express.static(path.join(__dirname, 'public')));

// Server listening  ---------------------------
http.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});