#antes que nada... para ir a la consola de postgres del servidor de heroku
heroku pg:psql

#para crear las tablas
CREATE TABLE sessions_info (id SERIAL PRIMARY KEY ,  session_id VARCHAR(128) NOT NULL , hash_actual  VARCHAR(128) NOT NULL default '',  creation_date datetime not null default CURRENT_TIMESTAMP );
TRUNCATE TABLE sessions_info; 
ALTER TABLE sessions_info ADD COLUMN hash_actual  VARCHAR(128) NOT NULL default '';
ALTER TABLE sessions_info ALTER COLUMN creation_date TYPE timestamp;
ALTER TABLE sessions_info ALTER COLUMN creation_date SET DEFAULT current_timestamp;
ALTER TABLE sessions_info ADD UNIQUE (session_id);

CREATE TABLE unique_id ( id SERIAL PRIMARY KEY , post_id VARCHAR(128) NOT NULL UNIQUE, post_text VARCHAR(255) NOT NULL , post_type VARCHAR(128) NOT NULL , post_votes VARCHAR(128) NOT NULL );

# para ver la estructura
\d sessions_info
\d unique_id
\dt

#para insertar registros a 'sessions_info'
INSERT INTO sessions_info  (session_id) values ('unique-id');

#para insertar registros a 'unique_id'
INSERT INTO unique_id (post_id, post_text, post_type, post_votes) values ($1, $2, $3, $4);

INSERT INTO unique_id (post_id, post_text, post_type, post_votes) VALUES($1, $2, $3, $4) ON CONFLICT (post_id) DO UPDATE SET post_votes = EXCLUDED.post_votes;

#para editar el hash_actual
UPDATE sessions_info SET hash_actual = '#/21/2' WHERE session_id = '"saki_::_1_20_6_2020_17_59_7_867"'; #el nombre de la tabla debe estar entre esas comillas dobles
