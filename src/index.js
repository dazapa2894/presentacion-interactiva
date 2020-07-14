const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

//Initialization
const app = express();

// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main', 
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir:path.join(app.get('views'), 'partials'),
  extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Middleware

// Global vars

// Routes
app.use( require('./routes/index') );

// Static Files
app.use(express.static( path.join(__dirname, 'public') ));

// Server listening
app.listen(app.get('port'), () =>{
console.log( 'Server on port', app.get('port') );
});