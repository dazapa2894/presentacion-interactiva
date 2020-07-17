const express = require('express');
const router = express.Router();

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


module.exports = router;