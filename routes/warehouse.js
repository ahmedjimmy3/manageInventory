const router = require("express").Router();
const conn = require("../db/dbconnection");
const authorized = require("../middleware/authorize");
// const   = require("../middleware/admin");
const {body ,validationResult} = require("express-validator");
const util = require("util");
const fs = require("fs")
const upload = require("../middleware/uploadimages")


router.post("/wh",
async (req,res)=>{  
    try{
        const query = util.promisify(conn.query).bind(conn);//transform query my sql --> promise to use await / async
        const checkWhName = await query("select * from warehouse where name = ?",[req.body.name])
        if (checkWhName.length > 0){
            return res.status(400).json({
                errors: [{
                    "msg" :  "name already exists"
                }]
            })
        } 
        const wh = { 
            name: req.body.name,
            location: req.body.location
        }
        await query("insert into warehouse set ?" , wh)
            res.status(200).json({
            msg: "insert add sucseessfuly"
        })
    }
    catch(err){
        res.status(500).json(err);
    }
})

router.get("",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const wh = await query("select * from warehouse ")
    
        res.status(200).json(wh)
})

router.get("/:id",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const wh = await query("select * from warehouse where id = ?" , [req.params.id])
        res.status(200).json(wh[0])
})

router.put("/:id",

async(req,res)=>{
try{
//vlaidation request
const query = util.promisify(conn.query).bind(conn); 
const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()}); 
}
const wh = await query("select * from warehouse where id =?",[req.params.id]);
if(!wh[0]){
 res.status(404).json({msg:"warehouse not found"})
}
const whObj = {
    name:req.body.name,   
    status:req.body.status, 
    location:req.body.location,
}

await query("update warehouse set ? where id = ? ",[whObj,wh[0].id])
res.status(200).json({msg:'warehouse updated successfuly',})
}

catch(err){
    console.log(err);
    res.status(500).json(err)
}
})

router.delete("/:id",

async(req,res)=>{
try{
const query = util.promisify(conn.query).bind(conn);

const wh = await query("select * from warehouse where id =?",[req.params.id]);
if(!wh[0]){
 res.status(404).json({msg:"warehouse not found"})
}
await query("delete from warehouse where id = ? ",[wh[0].id])
res.status(200).json({msg:'warehouse deleted successfuly',})
}
catch(err){
    console.log(err);
    res.status(500).json(err)
}
});
module.exports = router;




