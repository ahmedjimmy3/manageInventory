const router = require("express").Router();
const conn = require("../db/dbconnection");
const authorized = require("../middleware/authorize");
const admin = require("../middleware/admin");
const { body, validationResult } = require("express-validator");
const util = require("util");
const fs = require("fs");
const upload = require("../middleware/uploadimages");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

router.post("",
  body("user").isString().withMessage("please enter avalid name"),
  body("email").isEmail().withMessage("please enter avalid email"),
  body("phone")
    .isLength({ min: 10, max: 13 })
    .withMessage("please enter avalid phone number"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = util.promisify(conn.query).bind(conn); //transform query my sql --> promise to use await / async
      const checkEmail = await query("select * from users where email = ?", [
        req.body.email,
      ]);
      const checkWarehouseId = await query(
        "select * from users where warehouse_id = ?",
        [req.body.warehouse_id]
      );
      const checkWarehouseExist = await query(
        "select * from warehouse where id = ?",
        [req.body.warehouse_id]
      );
      if (checkWarehouseExist == 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "warehouse not found",
            },
          ],
        });
      }
      if (checkEmail.length > 0 || checkWarehouseId.length > 0) {
        return res.status(400).json({
          errors: [
            {
              msg: "email already exists or warehouse is assigned",
            },
          ],
        });
      } else {
        const newUser = {
          user: req.body.user,
          email: req.body.email,
          // status: req.body.status,
          phone: req.body.phone,
          token: crypto.randomBytes(16).toString("hex"),
          password: await bcrypt.hash(req.body.password, 10),
          warehouse_id: req.body.warehouse_id,
        };

        await query("insert into users set ?", newUser);
        res.status(200).json({
          msg: "insert new user success",
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

router.get("/:id" ,async (req, res) => {
  try {
    const query = util.promisify(conn.query).bind(conn);
    const us = await query("select * from users where id =?", [req.params.id]);
    if (!us[0]) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.status(200).json(us[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("", async (req, res) => {
  const query = util.promisify(conn.query).bind(conn);
  const wh = await query("select * from users where type != 0");

  res.status(200).json(wh);
}); 


router.put("/:id",
    body("email").isEmail().withMessage("please enter avalid email"),
  
    async (req, res) => { 
      try {
        const query = util.promisify(conn.query).bind(conn);
        const errors = validationResult(req);
        const checkEmail = await query("select * from users where email = ?", [req.body.email,]);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const checkWarehouseId = await query(
          "select * from users where warehouse_id = ?",
          [req.body.warehouse_id]
        );
        const checkWarehouseExist = await query(
          "select * from warehouse where id = ?",
          [req.body.warehouse_id]
        );
        if (checkEmail.length > 0 ||checkWarehouseExist === 0) {
          return res.status(400).json({
            errors: [
              {
                msg: "warehouse not found",
              },
            ],
          });
        } else {
          if ( checkWarehouseId.length > 0) {
            return res.status(400).json({
              errors: [
                {
                  msg: "email already exists or warehouse is assigned",
                },
              ],
            });
          } else {
            const user = await query("select * from users where id =?", [req.params.id]);
            if (!user[0]) {
              console.log(user[0]);
               return res.status(404).json({ msg: "user not found" });
            }
            const userobj = { 
              user: req.body.user,
              email: req.body.email,
              password: await bcrypt.hash(req.body.password, 10),
              status:req.body.status,
              phone: req.body.phone, 
              warehouse_id:req.body.warehouse_id
            };
            await query("update users set ? where id = ? ", [
              userobj,
              user[0].id,
            ]);
            res.status(200).json({ msg: "user updated successfuly" });
          }
        }
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );

router.delete("/:id",
  

  async (req, res) => {
    try {
      const query = util.promisify(conn.query).bind(conn);

      const user = await query("select * from users where id =?", [
        req.params.id,
      ]);
      if (!user[0]) {
        res.status(404).json({ msg: "user not found" });
      }

      await query("delete from users where id = ? ", [user[0].id]);
      res.status(200).json({ msg: "user deleted successfuly" });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);
module.exports = router;
