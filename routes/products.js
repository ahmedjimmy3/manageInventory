const router = require("express").Router();
const conn = require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const {body ,validationResult} = require("express-validator");
const util = require("util");
const fs = require("fs")
const upload = require("../middleware/uploadimages")

router.post("/create_product",
upload.single("image"),

async(req,res)=>{
try{
const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()});
}
//image require
if(!req.file){
   return res.status(400).json({
        errors:[
            {
                msg:"image is required"
            }
        ]
    })
}
//prepare
const product = {
    name:req.body.name, 
    description:req.body.description,
    quantity:req.body.quantity, 
    image:req.file.filename,
}
try
{
    const query = util.promisify(conn.query).bind(conn);
    const id_exist=await query("select * from warehouse where id =?",[req.body.warehouse_id])
    product.warehouse_id=req.body.warehouse_id
    await query("insert into product set ?",product)
    res.status(200).json({
    msg:"product created successfully"
})
}
catch(err){
    console.log(err);
    res.status(400).json({
        msg:"not found warehouse"
    })

}; 
}
catch(err){
    console.log(err);
res.status(500).json(err)
}

});
router.get("/listproduct",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const product = await query("select * from product ")
    product.map(prod =>{
        prod.image = "http://" + req.hostname + ":4000/" + prod.image
    })
        res.status(200).json(product) 
})
//get one product
router.get("/:id",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const product = await query("select * from product where id = ? " , [req.params.id])
    product.map(prod =>{
        prod.image = "http://" + req.hostname + ":4000/" + prod.image
    })
        res.status(200).json(product[0])
}) 
router.put("/:id", 
upload.single("image"),
async(req,res)=>{
try{

const query = util.promisify(conn.query).bind(conn);
const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()});
}

const product = await query("select * from product where id = ?",[req.params.id]);
if(!product[0]){
 res.status(404).json({msg:"product not found"})  
}

const productObj = { 
    name:req.body.name,
    warehouse_id:req.body.warehouse_id,
    quantity:req.body.quantity,
    description:req.body.description
}  
if(req.file){
    productObj.image=req.file.filename;
}
try   
{
    const query = util.promisify(conn.query).bind(conn);
    const id_exist=await query("select * from warehouse where id = ?",[req.body.warehouse_id])
    product.warehouse_id=req.body.warehouse_id
    await query("update product set ? where id = ? ",[productObj,product[0].id])
    res.status(200).json({msg:'product updated successfuly',})

}
catch(err){
    console.log(err);
    res.status(400).json({
        msg:"not found warehouse"
    }) 
};  

} 
catch(err){
    res.status(500).json(err)
}
});
router.delete("/:id",
async(req,res)=>{
try{
const query = util.promisify(conn.query).bind(conn);
const product = await query("select * from product where id = ?",[req.params.id]);
if(!product[0]){
 res.status(404).json({msg:"product not found"});
}
fs.unlinkSync("./upload/" + product[0].image)
await query("delete from product where id = ? ",[product[0].id])
res.status(200).json({msg:'product deleted successfuly',})
}
catch(err){
    console.log(err);
    res.status(500).json(err) 
}
});
 
module.exports = router; 
