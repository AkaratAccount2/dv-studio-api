var express = require('express');
var router = express.Router();
var getConnection = require('./../mysql-client');
const helper = require('./../helper/helper')
const APIError = require("./../helper/APIError")
const asyncMiddleware = require('./utils/asyncMiddleWare')

router.get('/healthcheck', function(req ,res, next){
    res.send(JSON.stringify({"status":"ok"}));
})

router.get('/dbconnect', async function(req ,res, next){
    let connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM dv_users');
    res.send(rows);
})

/** Authen Login */

const authen = (users, password, res) => {
    if (users.password === password) {
        res.json(
            new APIResponse(
                "Success",
                200,
                { role: users.role, grant_permission: users.grant_permission, decline_permission: users.decline_permission },
                true,
            ).jsonReturn()
        );
    } else {
        error(res, "Invalid username or password", 400, true)
    }
}
const error = (res, message, status, isPublic) => res.status(status).json(new APIError(message, status, isPublic).jsonReturn());


router.post("/v1/authen", asyncMiddleware(async (req, res, next) => {
    logger.info("[Admin] POST /v1/authen")
    let username = req.body.username
    let password = req.body.password

    if (!helper.isNullEmptry(username) && !helper.isNullEmptry(password)) {
        let connection = await getConnection();
        let statement = await connection.prepare('SELECT * FROM dv_users where username = ?');
        let [users] = await statement.execute([username]);
        //let users = await dbservice.getUsers(username)

        if (users[0]) {
            authen(users[0], password, res)
        } else {
            error(res, "USER_NOT_FOUND", 404, true)
        }
    }
}))

module.exports = router;