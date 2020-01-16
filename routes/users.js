var Firebase = require("firebase-admin");
var express = require("express");
var router = express.Router();

var errors = require("../errors");

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
});

router.post("/create", async (req, res, next) => {
  try {
    if (req.body.email && req.body.name) {
      await Firebase.auth()
        .createUser({
          email: req.body.email,
          displayName: req.body.name,
          password: "password"
        })
        .then(record => {
          return res.json({ user: record.uid });
        })
        .catch(async err => {
          if (err.code === errors.emailAlreadyExists) {
            const user = await Firebase.auth().getUserByEmail(req.body.email);
            return res.status(200).send({ userId: user.uid });
          } else {
            return res.status(400).send("Error creating user: " + err);
          }
        });
    } else {
      return res.status(400).send("Invalid details provided");
    }
  } catch (ex) {
    return res.status(400).send("Error creating user " + ex);
  }
});

module.exports = router;
