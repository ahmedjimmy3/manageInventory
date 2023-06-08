const router = require("express").Router();
const conn = require("../db/dbconnection")
const { body, validationResult } = require('express-validator');
const util = require("util")//helper
const bcrypt = require("bcrypt")
const crypto = require("crypto");
const authorized = require("../middleware/authorize");



router.post("/login" ,
body("email").isEmail().withMessage("please enter a vailid email"),
body("password").isLength({min:8 , max: 12}).withMessage("password should be between (8-12)"),
async (req ,res )=>{
    try {
        //1- validation req
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const query = util.promisify(conn.query).bind(conn);
    const user =await query("select * from users where email = ?", [req.body.email])
    if (user.length == 0){

        res.status(404).json({

            errors: [{
                "msg" :  "email  not exists"
            }]
        })
    }

    const checkPassword = await bcrypt.compare(req.body.password , user[0].password)
    if (checkPassword){
        delete user[0].password
        res.status(200).json(user[0])
    }
    else{
        res.status(400).json({
            errors: [{
                "msg" :  "password  not exists"
            }]
        })
    }  
    }
    catch(err){
        console.log(err)
        res.status(400).json({"msg":"not found"})
    }

} )



module.exports = router