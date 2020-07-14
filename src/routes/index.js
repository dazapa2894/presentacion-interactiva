const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
})

router.get('/control', (req, res) =>{
  res.render('control')
});

module.exports = router;