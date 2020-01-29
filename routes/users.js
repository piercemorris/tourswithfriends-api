var { Expo } = require("expo-server-sdk");
var Firebase = require("firebase-admin");
var express = require("express");
var router = express.Router();

var errors = require("../errors");

let expo = new Expo();

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

router.post("/giftNotif", async (req, res) => {
  // get user sending the gift
  const senderUid = req.body.senderUid;
  const receiverUid = req.body.receiverUid;

  if (senderUid) {
    const sender = Firebase.auth().getUser(senderUid);

    Firebase.database()
      .ref(`users/${receiverUid}`)
      .on("value", async snapshot => {
        const pushToken = snapshot.val().push_token;

        if (Expo.isExpoPushToken(pushToken)) {
          // add users name instead of generic notif

          const message = {
            to: pushToken,
            title: "New gift received!",
            body: "You have a new gift",
            sound: "default"
          };

          try {
            await expo.sendPushNotificationsAsync(message);

            return res.status(200);
          } catch (err) {
            console.error(err);
            return res.status(400).send("Error push token not valid: " + err);
          }
        } else {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          );
        }
      });
  }

  // get the push token of the user who is receiving the gift

  // check if push token is valid

  // create the appropriate message

  // send push notification
});

module.exports = router;
