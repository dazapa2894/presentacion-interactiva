const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/empresarial/', (req, res) => {
  res.render('index', {
    titulo: "Presentaciones",
    style_name: "index_style",
    subfolder: "empresarial",
    video_controls: "",
    votante: true,
    script_name: "index_js",
    empresarial: true
  });
})

router.get('/empresarial/control', (req, res) => {
  res.render('control', {
    titulo: "Controlador de presentaciones",
    style_name: "control_style",
    subfolder: "empresarial",
    video_controls: "controls",
    controlador: true,
    script_name: "control_js",
    empresarial: true
  })
});


// lo que estoy intentando es separar las diapositivas en carpetas 
// pero como que no detectan los estilos ni los videos o algo asi :(
  router.get('/politico-d/', (req, res) => {
    res.render('index', {
      titulo: "Presentaciones",
      style_name: "index_style",
      subfolder: "politico-d",
      video_controls: "",
      votante: true,
      script_name: "index_js",
      politico_d: true
    });
  })
  
  router.get('/politico-d/control', (req, res) => {
    res.render('control', {
      titulo: "Controlador de presentaciones",
      style_name: "control_style",
      subfolder: "politico-d",
      video_controls: "controls",
      controlador: true,
      script_name: "control_js",
      politico_d: true
    })
  });
  
  // lo que estoy intentando es separar las diapositivas en carpetas 
  // pero como que no detectan los estilos ni los videos o algo asi :(
    router.get('/politico-i/', (req, res) => {
      res.render('index', {
        titulo: "Presentaciones",
        style_name: "index_style",
        subfolder: "politico-i",
        video_controls: "",
        votante: true,
        script_name: "index_js",
        politico_i: true
      });
    })
    
    router.get('/politico-i/control', (req, res) => {
      res.render('control', {
        titulo: "Controlador de presentaciones",
        style_name: "control_style",
        subfolder: "politico-i",
        video_controls: "controls",
        controlador: true,
        script_name: "control_js",
        politico_i: true
      })
    });
    
    
    
    // presentacion - v1
    // router.get('/', (req, res) => {
    //   res.render('index', {
    //     titulo: "Presentaciones",
    //     style_name: "index_style",
    //     video_controls: "",
    //     votante: true,
    //     script_name: "index_js"
    //   });
    // })
    
    // router.get('/control', (req, res) => {
    //   res.render('control', {
    //     titulo: "Controlador de presentaciones",
    //     style_name: "control_style",
    //     video_controls: "controls",
    //     controlador: true,
    //     script_name: "control_js"
    //   })
    // });
    
    
    
module.exports = router;