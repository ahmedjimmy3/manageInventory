const express =  require("express")
const bodyParser = require('body-parser')

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.static("upload"))
const cors = require("cors")
app.use(cors());

const auth = require("./routes/auth")
const wh = require("./routes/warehouse")
const user = require("./routes/user")
const product = require("./routes/products")
const sendmails = require("./routes/mail")
const sendinfo = require("./routes/supervisor")

app.listen(4000 , "localhost" , ()=>{
    console.log("server is running");
})



app.use("/auth" , auth)
app.use("/warehouse" , wh)
app.use("/user" , user)
app.use("/products" , product)
app.use("/mail" , sendmails)
app.use("/supervisor" , sendinfo)

