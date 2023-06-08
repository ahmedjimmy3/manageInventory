const router = require("express").Router();
const conn = require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const {body ,validationResult} = require("express-validator");
const util = require("util");
const fs = require("fs")
const upload = require("../middleware/uploadimages");
const { response } = require("express");
const { log } = require("console");

router.post("/send",authorized,
body("email")
  .isString()
  .withMessage("please enter a valid email name"),
 
async(req,res)=>{ 
try{

const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()});
}
//prepare
const sendmail = {
    email:req.body.email,
    message:req.body.message,
    product_id:req.body.product_id,
    quantity:req.body.quantity,
    warehouse_id:req.body.warehouse_id,
    transaction:req.body.transaction,
}
const data = { 
    mail:res.locals.user.email ,
    warehouse : res.locals.user.warehouse_id
}

const query = util.promisify(conn.query).bind(conn);
    

    
    const productCheck = await query("select * from product where id = ? and warehouse_id = ?" , [req.body.product_id , req.body.warehouse_id])
    
    
    if ((data.mail != sendmail.email) || (data.warehouse != sendmail.warehouse_id) || ((sendmail.product_id != productCheck[0].id) && (sendmail.warehouse_id != data.warehouse) ) ){
        res.status(404).json({
            errors: [{
                "msg" :  "wrong information"
            }]
        })
    }
    else{
        await query("insert into send_mail set ?",sendmail)
            res.status(200).json({
            msg:"message send sucsses"
        })
    }
}
catch(err){ 
    console.log(err);
res.status(500).json(err)
}

});

router.get("/recive",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const recive = await query("select * from send_mail ")
        res.status(200).json(recive)
})

// all reports
router.get("/all",async (req,res)=>{ 
    const query = util.promisify(conn.query).bind(conn);
    const recive = await query("select * from report ")
        res.status(200).json(recive)
})

router.get("/recivesuper",authorized,async (req,res)=>{ 
    const data = { 
        mail:res.locals.user.email ,
    }
    const query = util.promisify(conn.query).bind(conn);
    const requests = await query("select * from report where email = ?" , data.mail)
    
        res.status(200).json(requests)
})

//response accepted or declined
router.put("/:id",async(req,res)=>{
    try{
    const query = util.promisify(conn.query).bind(conn);
    const mail = await query("select * from send_mail where id = ?",[req.params.id]);
    if(!mail[0]){
     res.status(404).json({msg:"product not found"});
    }
    const response={
        response : req.body.response
    }
    await query("update send_mail set ? where id = ? ",[response, mail[0].id])
    const email = await query("select * from send_mail where id = ?",[req.params.id]);
    await query("insert into report set ?",email) 
    const OrderQuantity = await query("select * from send_mail where id = ?",[req.params.id]);
    const TableProduct = await query("select * from product where id=? and warehouse_id = ?",[mail[0].product_id , mail[0].warehouse_id]);

    let sum;
  
    if(OrderQuantity[0].response == 'accepted'){
        if(OrderQuantity[0].transaction == 'increase'){
            sum = OrderQuantity[0].quantity + TableProduct[0].quantity ; 
        }
        else{
            sum = TableProduct[0].quantity - OrderQuantity[0].quantity  ; 
            if(sum<0){
                sum=0;
            }
        }
    } 
    else{
        sum = TableProduct[0].quantity;
    } 

    const newQuantityProduct = {
        quantity : sum
    } 
    await query("update product set ? where id = ? ",[newQuantityProduct, mail[0].product_id])
    res.status(200).json({msg:'product deleted successfuly',})
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
    const email = await query("select * from send_mail where id = ?",[req.params.id]);
    if(!email[0]){
     res.status(404).json({msg:"product not found"});
    }
    await query("delete from send_mail where id = ? ",[email[0].id])
    res.status(200).json({msg:'email deleted successfuly',})
    }
    catch(err){
        console.log(err);
        res.status(500).json(err) 
    }
    });
 
 

module.exports = router;

