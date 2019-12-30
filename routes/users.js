var Firebase = require("firebase-admin");
var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", (req, res, next) => {
  res.send("respond with a resource");
});

router.post("/create", async (req, res, next) => {
  console.log("users/create");
  try {
    if (req.body.email && req.body.name) {
      console.log("creating a user");
      await Firebase.auth()
        .createUser({
          email: req.body.email,
          displayName: req.body.name,
          password: "password"
        })
        .then(record => {
          console.log("User is", record);
          return res.json(record);
        })
        .catch(err => {
          console.log("ERROR:", err);
          return res.status(400).send("Error creating user: " + err);
        });
    } else {
      return res.status(400).send("Invalid details provided");
    }
  } catch (ex) {
    console.log("catch err");
    return res.status(400).send("Error creating user " + ex);
  }
});

module.exports = router;
