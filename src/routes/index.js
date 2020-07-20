const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  res.render('index', {
    titulo: "Presentaciones",
    style_name: "index_style",
    video_controls: "",
    votante: true,
    script_name: "index_js"
  });
})

router.get('/control', (req, res) => {
  res.render('control', {
    titulo: "Controlador de presentaciones",
    style_name: "control_style",
    video_controls: "controls",
    controlador: true,
    script_name: "control_js"
  })
});

router.get('/api/db', async (req, res, next) => {

  try {
    let results = await db.all();
    res.json(results);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }

  // res.render('db_views/all',{
  //   showdb: true,
  //   test: 'test'
  // });
});


module.exports = router;