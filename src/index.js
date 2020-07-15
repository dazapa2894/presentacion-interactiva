const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

//Initialization
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main', 
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir:path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

// Middleware
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
});

// Global vars

// Routes
app.use( require('./routes/index') );

// Static Files
app.use(express.static( path.join(__dirname, 'public') ));

// Server listening
http.listen(app.get('port'), () =>{
console.log( 'Server on port', app.get('port') );
});