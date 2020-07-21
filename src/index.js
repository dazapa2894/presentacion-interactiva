const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const apiRouter = require('./routes');
// const mysql = require('mysql');
const bodyparser = require('body-parser');
// unique id creator


// easter egg :v
const cool = require('cool-ascii-faces');

// for the postgres database
const {
  Pool
} = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: 'postgres',
  password: 'keylogger12',
  database: 'presentacion-interactiva',
  /*ssl: {
    rejectUnauthorized: false
  },*/
  ssl: false,
  //ssl: process.env.DATABASE_URL ? true : false
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

    let table_name = '';
    let client_name = '';
    let session_date = '';
    let existen_sesiones = false;
    let sesion_vacia = false;
    let all_sessions_data = [];
    
    
    const sessions_table_name_result = await client.query('SELECT session_id FROM sessions_info ORDER BY creation_date DESC;');

    // si existe al menos una sesion
    if (sessions_table_name_result.rowCount > 0) {
      existen_sesiones = true;
      
      console.log("lista de sesiones");
      console.log(sessions_table_name_result.rows);

      // recorro cada uno de los nombres de las sessiones
      sessions_table_name_result.rows.forEach(element => {
        let table_name = element.session_id;
        // console.log('----------table_names--------');
        // console.log(table_name);
        // si no existe ninguna sesion 
        if (table_name == '') {
          existen_sesiones = false;
        } else {
          // en caso de que al menos hay una sesion creada
          // consulto la ultima tabla de sesion a base de la anterior consulta
          const last_session_result = client.query('SELECT * FROM ' + table_name + ';');
          last_session_result.then(session_data => {
            // console.log('/////////table_names 2/////////');
            // console.log(table_name);
            client_name = table_name.split("_::_")[0].substr(1);
            session_date = table_name.split("_::_")[1].split("__")[0].split('_').join('-');
            
            // console.log(client_name);
            // console.log(session_date);
            // console.log(session_data.rowCount);

            let this_session_data = {
              is_empty: false,
              nombre_sesion: client_name,
              fecha_sesion: session_date,
              posts: session_data.rows
            }

            all_sessions_data.push(this_session_data);



            console.log("------------ALL SESSIONS DATA--------");
            console.log(all_sessions_data);


            res.render('db_views/db', {
              showdb: true,
              existen_sesiones: existen_sesiones,
              sessions: all_sessions_data
            });

          });
        }

      });

    }

    

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


io.on('connection', (socket) => {

  // console.log('a user connected');

  /* 
  llenar variables del servidor que controlen: 
  * el hash actual de la presentacion 
  * el array de objetos que mantiene actualizados a los ususarios
  - el objeto que controla los videos


  
  */



  // PARA LOS CLIENTE QEU ENTRAN DESPUES DE HABER INICIADO SESION
  if (session_id != '') {
    socket.emit('active_session', session_id);

    // tomar todos los datos de la base de datos

  } else {
    console.log('NO HAY SESIONES ACTIVAS');
  }

  // recibo la orden de iniciar session
  socket.on('init_session', (data) => {

    if (session_id == '') {
      var datetime = new Date();
      // CREO UN FORMATO DE FECHA PARA HACER LA TABLA UNICA "nombreTabla_dia_mes_año_hora_minuto_segundo_mili"
      let day = datetime.getDate();
      let month = datetime.getMonth();
      let year = datetime.getFullYear();
      let hour = datetime.getHours();
      let minute = datetime.getMinutes();
      let second = datetime.getSeconds();
      let mili = datetime.getMilliseconds();
      var my_date_format = day + '_' + month + '_' + year + '__' + hour + '_' + minute + '_' + second + '_' + mili;

      // el '_::_' sera el separador para identificar el nombre del cliente
      session_id = data.client_name + '_::_' + my_date_format;
      console.log('nueva sesion activa = ', session_id);
    }


    try {
      const client = pool.connect();
      client.then(connection => {

        session_id = connection.escapeIdentifier(session_id);
        let new_table_result = connection.query("CREATE TABLE IF NOT EXISTS " + session_id + " ( id SERIAL PRIMARY KEY , post_id VARCHAR(128) NOT NULL , post_text VARCHAR(255) NOT NULL , post_type VARCHAR(128) NOT NULL , post_votes VARCHAR(128) NOT NULL );");

        new_table_result.then(new_table_data => {
          // console.log(new_table_data);
          console.log("TABLA '" + session_id + "' CREADA...");
          let insert_in_table_list_result = connection.query("INSERT INTO sessions_info(session_id) values($1);", [session_id]);

          new_table_result.then(insert_in_table_list_data => {
            //  console.log(insert_in_table_list_data);
            console.log("NOMBRE DE LA TABLA '" + session_id + "' INSERTADA EN LA LISTA...");

            console.log("ACTIVANDO SESSION DE SOCKET");
            io.emit('active_session', session_id);
          });
        });
        connection.release();
      });

    } catch (err) {
      console.error(err);
      console.log("Error " + err);
    }

  }); // SOCKET END init_session


  // REINICIO LAS VARIABLES DEL SERVIDOR
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

    //
    try {
      const client = pool.connect();
      client.then(connection => {
        let session_vars_result = connection.query("SELECT * FROM public.sessions_info WHERE session_id = $1 ORDER BY creation_date ASC LIMIT 1;", [session_id]);

        session_vars_result.then(session_vars_data => {
          console.log('session_vars_data = ', session_vars_data);

        });

        connection.release();
      });

    } catch (err) {
      console.error(err);
      console.log("Error " + err);
    }

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

    //ideas
    io.emit("refresh_ideas", postit_array);
  });

  socket.on('ideaVoted', (data) => {
    console.log("idea votada / data = ", data);
    // enviando votos
    console.log('ideaVoted...');
    // console.log(data);
    // console.log(postit_array[data.id]);

    postit_array[data.id].votes = data.num_votes;

    io.emit("refresh_ideas", postit_array);

  });

  // para guardar filas en la BD
  socket.on('save_notes', (data) => {

    // app.all('*', async (req, res) => {
    let posts = data.posts;

    Object.keys(posts).forEach(key => {
      // console.log("GUARDANDO ESTOS DATOS DEL POST");
      // console.log(posts[key].post_id);
      // console.log(posts[key].post_text);
      // console.log(posts[key].post_type);
      // console.log(posts[key].post_votes);


      try {
        const client = pool.connect();
        client.then(connection => {
          console.log("insrting in this session_id= ", session_id);
          let sql = "INSERT INTO " + session_id + " (post_id, post_text, post_type, post_votes) VALUES ($1, $2, $3, $4) ON CONFLICT(post_id) DO UPDATE SET post_votes = EXCLUDED.post_votes;";
          let session_result = connection.query(sql, [posts[key].post_id, posts[key].post_text, posts[key].post_type, posts[key].post_votes]);

          session_result.then(results => {
            // console.log(results);
            let insert_results = {
              'row': (results) ? results.rows : null
            };
            // console.log(insert_results);
          });

          connection.release();
        });

      } catch (err) {
        console.error(err);
        console.log("Error " + err);
      }

    });
    // });

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