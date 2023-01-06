var express = require('express');
var router = express.Router();
var logger = require("./../config/winston")(__filename)
var getConnection = require('./../mysql-client');
const helper = require('./../helper/helper')
const APIError = require("./../helper/APIError")
const APIResponse = require("./../helper/APIResponse")
const asyncMiddleware = require('./utils/asyncMiddleWare')


const defaultEmptryValue = (value) => {
    return helper.isNullEmptry(value)?'':value
}

const datetimeConvertToDB = (dateTimeString) => {
    //const dateTimeString = '2023-01-05T04:44:04.333Z';

    const date = new Date(dateTimeString); // that convert to date with locale timezone
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const seconds = `0${date.getSeconds()}`.slice(-2);
    const formattedDateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    console.log(formattedDateTimeString); // Output: "2023-01-05 04:44:04"
    return formattedDateTimeString
}


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
        let [users] = await statement.execute([username]); //return [ row_object ]
       
        connection.end();
        if (users[0]) {
            authen(users[0], password, res)
        } else {
            error(res, "USER_NOT_FOUND", 404, true)
        }
    }
}))


/** Profile */
router.post("/v1/profile/search", asyncMiddleware(async (req, res, next) => {
    logger.info(`[Admin] GET /v1/profile/search`)
    let codeNumber = defaultEmptryValue(req.body.codeNumber);
    let email = defaultEmptryValue(req.body.email);
    let firstName = defaultEmptryValue(req.body.firstName);
    let lastName = defaultEmptryValue(req.body.lastName);
    let nickName = defaultEmptryValue(req.body.nickName);
    let phoneNumber = defaultEmptryValue(req.body.phoneNumber);
    console.log(req.body)
    let sql_search = "SELECT * FROM dv_person_profile ";
    let where_clase = ""
    if(!helper.isNullEmptry(codeNumber)){
        where_clase = where_clase + " usercode like '%"+codeNumber+"%' or"
    }
    if(!helper.isNullEmptry(email)){
        where_clase = where_clase + " email='"+email+"' or"
    }
    if(!helper.isNullEmptry(firstName)){
        where_clase = where_clase + " first_name like '%"+firstName+"%' or"
    }
    if(!helper.isNullEmptry(lastName)){
        where_clase = where_clase + " last_name like '%"+lastName+"%' or"
    }
    if(!helper.isNullEmptry(nickName)){
        where_clase = where_clase + " nick_name like '%"+nickName+"%' or"
    }
    if(!helper.isNullEmptry(phoneNumber)){
        where_clase = where_clase + " tel like '"+phoneNumber+"%' or"
    }
    if(where_clase.length > 5){
        where_clase = where_clase.slice(0,-2)
        where_clase = " where "+ where_clase
    }
    let connection = await getConnection();
    console.log(`SQL : ${sql_search + where_clase + ' order by register_date desc ' }`)
    let [person] = await connection.query(sql_search + where_clase + 'order by register_date desc'); //return [ row_object ]
    // console.dir(person)
    // let i = 0;
    // person = person.map((p) => {
    //     p.id = i++
    //     return p
    // })
    // console.dir(person)
    res.json(
        new APIResponse(
            "Success", 
            200, 
            person, 
            true 
    ).jsonReturn())    
}))

router.get("/v1/profile/:usercode", asyncMiddleware(async (req, res, next) => {
    let usercode = req.params.usercode;
    //logger.info(`[Admin] GET /v1/profile/${usercode}`)
    let connection = await getConnection();
    let statement = await connection.prepare('SELECT * FROM dv_person_profile where usercode = ?');
    let [person] = await statement.execute([usercode]); //return [ row_object ]
    res.json(
        new APIResponse(
            "Success", 
            200, 
            person[0]?person[0]:{}, 
            true 
    ).jsonReturn())    
}))

router.post("/v1/profile/create", asyncMiddleware(async (req, res, next) => {
    logger.info("[Admin] POST /v1/profile/create")
    let registrationDate = defaultEmptryValue(req.body.registrationDate)
    let codeNumber = defaultEmptryValue(req.body.codeNumber)
    let firstName = defaultEmptryValue(req.body.firstName)
    let lastName = defaultEmptryValue(req.body.lastName)
    let nickName = defaultEmptryValue(req.body.nickName)
    let educationName = defaultEmptryValue(req.body.educationName)
    let educationGrade = defaultEmptryValue(req.body.educationGrade)
    let email = defaultEmptryValue(req.body.email)
    let facebook = defaultEmptryValue(req.body.facebook)
    let birthDate = defaultEmptryValue(req.body.birthDate)
    let studentType = defaultEmptryValue(req.body.studentType)
    let note = defaultEmptryValue(req.body.note)
    let address = defaultEmptryValue(req.body.address)
    let tel = defaultEmptryValue(req.body.tel)
    let telEmergency = defaultEmptryValue(req.body.telEmergency)
    let parentName = defaultEmptryValue(req.body.parentName)
    
    if (!helper.isNullEmptry(codeNumber) && !helper.isNullEmptry(firstName)) {
        let connection = await getConnection();
        let sql_insert = "Insert into dv_person_profile ( usercode, email, facebook, first_name, last_name, nick_name, register_date,"+
                         " person_type, note, birth_date, education_name, education_grade, user_address, tel, tel_emer, parent_name) " +
                         " Values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? ) "
        let statement = await connection.prepare(sql_insert);
        let person = await statement.execute([codeNumber,email,facebook,firstName,lastName,nickName,datetimeConvertToDB(registrationDate),studentType,note,datetimeConvertToDB(birthDate),educationName,educationGrade,address,tel,telEmergency,parentName]); //return [ row_object ]
        console.log("Inserted table dv_person_profile")
        console.log(person)
        connection.end();
        res.json(
            new APIResponse(
                "Success", 
                200, 
                person, 
                true 
        ).jsonReturn()) 
    }

}))

router.get("/v1/student_type", asyncMiddleware(async (req, res, next) => {
    logger.info(`[Admin] GET /v1/student_type`)
    let connection = await getConnection();
    let statement = await connection.prepare('SELECT name FROM dv_person_type where locale = ? ');
    let [options] = await statement.execute(['th']); //return [ row_object ]
    res.json(options)
}))

/** ############### LEARN PROFILE #################### */
router.post("/v1/profile/learn/create", asyncMiddleware(async (req, res, next) => {
    logger.info("[Admin] POST /v1/profile/learn/create")
    let usercode = defaultEmptryValue(req.body.usercode)
    let learnNo = defaultEmptryValue(req.body.learnNo)
    let primaryDay = defaultEmptryValue(req.body.primaryDay)
    let time = defaultEmptryValue(req.body.time)
    let startDate = defaultEmptryValue(req.body.startDate)
    let bookingTotal = defaultEmptryValue(req.body.bookingTotal)
    let bookingDurationTime = defaultEmptryValue(req.body.bookingDurationTime)
   
    let parse_startDate = datetimeConvertToDB(startDate);
    parse_startDate = parse_startDate.slice(0,11) + time + ':00' 
    if (!helper.isNullEmptry(learnNo) && !helper.isNullEmptry(usercode)) {
        let connection = await getConnection();
        let sql_insert = "Insert into dv_learn_profile ( usercode, gen_learn_no, class_primary_day, class_time, class_start_date, class_booking_total, class_booking_duration_time) "+
                         " Values(?,?,?,?,?,?,? ) "
        let statement = await connection.prepare(sql_insert);
        let learn = await statement.execute([usercode,learnNo,primaryDay,time,parse_startDate,bookingTotal,bookingDurationTime]); //return [ row_object ]
        console.log("Inserted table dv_learn_profile")
        console.log(learn)
        connection.end();
        res.json(
            new APIResponse(
                "Success", 
                200, 
                learn, 
                true 
        ).jsonReturn()) 
    }
}))

router.post("/v1/profile/learn/search", asyncMiddleware(async (req, res, next) => {
    logger.info(`[Admin] GET /v1/profile/learn/search`)
    let codeNumber = defaultEmptryValue(req.body.codeNumber);
    let learnNo = defaultEmptryValue(req.body.learnNo);
    let startDate = defaultEmptryValue(req.body.startDate);
    let primaryDay = defaultEmptryValue(req.body.primaryDay);
   
    console.log(req.body)
    let sql_search = "SELECT * FROM dv_learn_profile ";
    let where_clase = ""
    if(!helper.isNullEmptry(codeNumber)){
        where_clase = where_clase + " usercode like '%"+codeNumber+"%' or"
    }
    if(!helper.isNullEmptry(learnNo)){
        where_clase = where_clase + " gen_learn_no like '%"+learnNo+"%' or"
    }
    if(!helper.isNullEmptry(primaryDay)){
        where_clase = where_clase + " class_primary_day = '"+primaryDay+"' or"
    }
    if(!helper.isNullEmptry(startDate)){
        where_clase = where_clase + " class_start_date like '%"+startDate+"%' or"
    }
    
    if(where_clase.length > 5){
        where_clase = where_clase.slice(0,-2)
        where_clase = " where "+ where_clase
    }
    let connection = await getConnection();
    console.log(`SQL : ${sql_search + where_clase + ' order by class_start_date desc ' }`)
    let [learns] = await connection.query(sql_search + where_clase + 'order by class_start_date desc'); //return [ row_object ]
    
    res.json(
        new APIResponse(
            "Success", 
            200, 
            learns, 
            true 
    ).jsonReturn())    
}))

router.get("/v1/profile/learn/:learn_no", asyncMiddleware(async (req, res, next) => {
    let learnNo = req.params.learn_no;
    //logger.info(`[Admin] GET /v1/profile/learn/${learn_no}`)
    let connection = await getConnection();
    let statement = await connection.prepare('SELECT * FROM dv_learn_profile where gen_learn_no = ?');
    let [learn] = await statement.execute([learnNo]); //return [ row_object ]
    res.json(
        new APIResponse(
            "Success", 
            200, 
            learn[0]?learn[0]:{}, 
            true 
    ).jsonReturn())    
}))

router.get("/v1/profile/all/learn/:usercode", asyncMiddleware(async (req, res, next) => {
    let usercode = req.params.usercode;
    //logger.info(`[Admin] GET /v1/profile/all/learn/${usecode}`)
    let connection = await getConnection();
    let statement = await connection.prepare('SELECT * FROM dv_learn_profile where usercode = ?');
    let [learns] = await statement.execute([usercode]); //return [ row_object ]
    res.json(
        new APIResponse(
            "Success", 
            200, 
            learns, 
            true 
    ).jsonReturn())    
}))

module.exports = router;


// const _datetimeConvertToDB = (dateTimeString) => {
//     //const dateTimeString = '2023-01-05T04:44:04.333Z';
//     console.log(dateTimeString); 
//     const date = new Date(dateTimeString);
//     const formattedDateTimeString = new Intl.DateTimeFormat(undefined, {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//       }).format(date);

//     // date.toLocaleString({
//     //     year: 'numeric',
//     //     month: '2-digit',
//     //     day: '2-digit',
//     //     hour: '2-digit',
//     //     minute: '2-digit',
//     //     second: '2-digit'
//     //   },);

//     console.log(formattedDateTimeString); // Output: "2023-01-05 04:44:04"
//     return formattedDateTimeString;
// }