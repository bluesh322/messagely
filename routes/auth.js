const express = require("express");


const User = require("../models/user");
const Message = require("../models/message");
const { BCRYPT_WORK_FACTOR } = require("../config");
const ExpressError = require("../expressError");

const router = new express.Router();

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next) {
    try {
      const customers = await User.login();
      return res.render("customer_list.html", { customers });
    } catch (err) {
      return next(err);
    }
  });


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async function(req, res, next) {
    try {
      const user = await User.register(username, password, first_name, last_name, phone);
      if (!User.authenticate(user.username, user.password)) {
          throw new ExpressError("Invalid username or password", 404);
      }
      User.updateLoginTimestamp(user.username);
      return res.render("index.html", { user });
    } catch (err) {
      return next(err);
    }
  });
