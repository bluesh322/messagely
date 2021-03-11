const express = require("express");
const ExpressError = require("../../../../Downloads/express-messagely-solution/express-messagely-solution/expressError");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth")
const Message = require("../models/message");
const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {
        
      const message = await Message.get();
      return res.json({ message: message });
    } catch (err) {
      return next(err);
    }
  });


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {
      const {to_username, body} = req.body;
      const message = await Message.create({
          from_username: req.user.username, 
          to_username: to_username, 
          body: body});
      const send = await Message.send(message);
      return res.json({ message: message });
    } catch (err) {
      return next(err);
    }
  });


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    try {
      let {username} = req.user;
      const {id} = req.params;
      let msg = Message.get(id);

      if (msg.to_user.username !== username) {
          throw new ExpressError("Cannot set this message to read", 401);
      }

      let message = await Message.markRead(id);
      return res.json({ message: message });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;