const router = require("express").Router();
const conn = require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const {body ,validationResult} = require("express-validator");
const util = require("util");
const fs = require("fs")
const upload = require("../middleware/uploadimages")

router.get("/reciveinfo",authorized,async (req,res)=>{ 
    try{
        const data = {
            id:res.locals.user.warehouse_id ,
        } 
        
        const query = util.promisify(conn.query).bind(conn);
        const recive = await query("select * from warehouse where id =? " , data.id)
            res.status(200).json(recive)
    }
    catch(err){
        res.status(500).json(err);
    }
   
})
router.get("/prodinfo",authorized,async (req,res)=>{ 
    try{
        const data = {
            id:res.locals.user.warehouse_id ,
        }
        const query = util.promisify(conn.query).bind(conn);
        const product = await query("select * from product where warehouse_id =? " , data.id)
        product.map(prod =>{
            prod.image = "http://" + req.hostname + ":4000/" + prod.image
        })
            res.status(200).json(product)
    }
    
        catch(err){
            res.status(500).json(err);
        }
})
router.get("/homeproduct",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const product = await query("select * from product LIMIT 3 ")
    product.map(prod =>{
        prod.image = "http://" + req.hostname + ":4000/" + prod.image
    })
        res.status(200).json(product)
})
router.get("/homeuser",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const product = await query("select * from users where type != 0 LIMIT 3")
        res.status(200).json(product)
})
    
module.exports = router; 
