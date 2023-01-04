var express = require('express');
var router = express.Router();
var getConnection = require('./../mysql-client');

router.get('/healthcheck', function(req ,res, next){
    res.send(JSON.stringify({"status":"ok"}));
})

router.get('/dbconnect', async function(req ,res, next){
    let connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM dv_users');
    res.send(rows);
})

module.exports = router;