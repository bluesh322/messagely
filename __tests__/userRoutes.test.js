const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");
let testUserToken;

describe("Users Routes Test", () => {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    testUserToken = jwt.sign({ username: "test1" }, SECRET_KEY);
  });

  describe("GET /users", () => {
    test("can get all users", async () => {
      let response = await request(app)
        .get("/users")
        .send({ _token: testUserToken });
      expect(response.body).toEqual({
        users: [
          {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
          },
        ],
      });
    });
  });

  describe("Get /users/:username", () => {
    test("can get a user by id", async () => {
      let response = await request(app)
        .get("/users/test1")
        .send({ _token: testUserToken });
      expect(response.body).toEqual({
        user: {
          username: "test1",
          first_name: "Test1",
          last_name: "Testy1",
          phone: "+14155550000",
          join_at: expect.any(String),
          last_login_at: expect.anything(),
        },
      });
    });

    test("expect 401 on incorrect user", async () => {
      let response = await request(app)
        .get("/users/nope")
        .send({ _token: testUserToken });
      expect(response.statusCode).toEqual(401);
    });
  });
});

describe("Users Routes Test", () => {
  beforeEach(async () => {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155550000",
    });

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "sup",
    });

    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "hey man I hope you are doing well, I love you",
    });
    
    testUserToken = jwt.sign({ username: "test1" }, SECRET_KEY);

  });

  describe("Get /users/:username/to", () => {
    test("can get message labelled 'to' user", async () => {
      let response = await request(app)
        .get("/users/test1/to")
        .send({ _token: testUserToken });
      expect(response.body).toEqual({
        messages: [
          {
            body: "hey man I hope you are doing well, I love you",
            from_user: {
              first_name: "Test2",
              last_name: "Testy2",
              phone: "+14155550000",
              username: "test2",
            },
            id: expect.any(Number),
            read_at: null,
            sent_at: expect.any(String),
          },
        ],
      });
    });
  });

  describe("Get /users/:username/to", () => {
    test("can get message labelled 'to' user", async () => {
        let response = await request(app)
        .get("/users/test1/from")
        .send({ _token: testUserToken });
      expect(response.body).toEqual({
        messages: [
          {
            body: "sup",
            to_user: {
              first_name: "Test2",
              last_name: "Testy2",
              phone: "+14155550000",
              username: "test2",
            },
            id: expect.any(Number),
            read_at: null,
            sent_at: expect.any(String),
          },
        ],
      });
    });
  });
});

afterAll(async function () {
  await db.end();
});
