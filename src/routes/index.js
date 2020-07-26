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

// lo que estoy intentando es separar las diapositivas en carpetas 
// pero como que no detectan los estilos ni los videos o algo asi :(
router.get('/empresarial/', (req, res) => {
  res.render('index', {
    titulo: "Presentaciones",
    style_name: "index_style",
    subfolder: "empresarial",
    video_controls: "",
    votante: true,
    script_name: "index_js"
  });
})

router.get('/empresarial/control', (req, res) => {
  res.render('control', {
    titulo: "Controlador de presentaciones",
    style_name: "control_style",
    subfolder: "empresarial",
    video_controls: "controls",
    controlador: true,
    script_name: "control_js"
  })
});



module.exports = router;