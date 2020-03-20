var { Expo } = require("expo-server-sdk");
var Firebase = require("firebase-admin");
var express = require("express");
var randomstring = require("randomstring");
var nodemailer = require("nodemailer");
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
      const password = randomstring.generate(10);

      await Firebase.auth()
        .createUser({
          email: req.body.email,
          displayName: req.body.name,
          password: password
        })
        .then(record => {
          console.log("before email");
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "citytourswithfriends@gmail.com",
              pass: process.env.TRANSPORT_PASS
            }
          });

          console.log("before mail options");
          var mailOptions = {
            from: "citytourswithfriends@gmail.com",
            to: req.body.email,
            subject: "New account created!",
            text: `Hi!
              
              A friend is trying to send you a personalised city tour gift to you, using this email!
                
              Sign into your account now by downloading the app, using the same email address as this one but use the password - ${password ||
                ""}`
          };

          console.log("before sending mail");
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });

          console.log("before returning");
          return res.json({ userId: record.uid });
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

const getSenderName = uid => {
  return Firebase.database()
    .ref(`users/${uid}`)
    .once("value");
};

const getReceiverPushToken = uid => {
  return Firebase.database()
    .ref(`users/${uid}`)
    .once("value");
};

router.post("/giftNotif", async (req, res) => {
  const senderUid = req.body.senderUid;
  const receiverUid = req.body.receiverUid;

  if (senderUid) {
    const senderName = (await getSenderName(senderUid)).val().displayName;
    const receiverPushToken = (await getReceiverPushToken(receiverUid)).val()
      .push_token;

    const messages = [
      {
        to: receiverPushToken,
        title: "New city tour gift received!",
        body: `You have a new gift from ${senderName}`,
        sound: "default"
      }
    ];

    expo
      .sendPushNotificationsAsync(messages)
      .then(() => {
        return res.status(200).send("Push notification sent successfully");
      })
      .catch(err => {
        return res.status(400).send("Error push token not valid: " + err);
      });
  } else {
    return res
      .status(400)
      .send(`Push token ${pushToken} is not a valid Expo push token`);
  }
});

module.exports = router;
