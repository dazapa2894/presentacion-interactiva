#antes que nada... para ir a la consola de postgres del servidor de heroku
heroku pg:psql

#para crear las tablas
CREATE TABLE sessions_info (id SERIAL PRIMARY KEY ,  session_id VARCHAR(128) NOT NULL ,  creation_date date not null default CURRENT_DATE );
CREATE TABLE unique_id ( id SERIAL PRIMARY KEY , post_id VARCHAR(128) NOT NULL , post_text VARCHAR(255) NOT NULL , post_type VARCHAR(128) NOT NULL );

# para ver la estructura
\d sessions_info
\d unique_id

#para insertar registros a 'sessions_info'
INSERT INTO sessions_info  (session_id) values ('unique-id');

#para insertar registros a 'unique_id'
INSERT INTO unique_id  (post_id, post_text, post_type) values ('post-id', 'post-text', 'post-type');