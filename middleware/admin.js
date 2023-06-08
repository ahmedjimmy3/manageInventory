const { type } = require("os");
const conn = require("../db/dbconnection")
const util = require("util")//helper

const admin = async (req,res, next) => {
    const query = util.promisify(conn.query).bind(conn);
    const admin = await query("select * from users where type = ?", [type])
    if (admin[0] && admin[0].type === 0){    
        next()
    }else{
        res.status(403).json([{
            msg : "you are not authorized"
        }])
    }
}




module.exports=admin