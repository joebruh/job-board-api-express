require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");

const app = require("../src/app");
const mongoose = require("mongoose");
const User = require("../src/models/User");

describe("Auth API", () => {
  before(async () => {
    await mongoose.connect(
      "mongodb://mongoadmin:secretpassword@localhost:27017/jobboard_test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        authSource: "admin",
      }
    );
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  let payload = {
    username: "testuser",
    password: "password123",
    role: "Candidate",
    fullName: "test candidate",
    email: "testcandidate@example.com",
    phone: "0483298323",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new candidate", async () => {
      const res = await request(app).post("/api/auth/register").send(payload);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body.username).to.equal(payload.username);
      expect(res.body.role).to.equal(payload.role);
      expect(res.body.candidateProfile.name).to.equal(payload.fullName);
      expect(res.body.candidateProfile.email).to.equal(payload.email);
      expect(res.body.candidateProfile.phone).to.equal(payload.phone);
    });

    it("should reject duplicate usernames", async () => {
      await User.create({
        username: "testuser",
        passwordHash: "somehash",
        role: "Candidate",
        fullName: "test candidate",
        email: "testcandidate@example.com",
        phone: "0483298323",
      });

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        password: "password123",
        role: "Candidate",
        fullName: "test candidate",
        email: "testcandidate@example.com",
        phone: "0483298323",
      });

      expect(res.status).to.equal(400);
      expect(res.body.error).to.equal("Username already taken");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("password123", 10);
      await User.create({
        username: "testCandidate",
        passwordHash,
        role: "Candidate",
      });
    });

    it("should log candidate in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "testCandidate",
        password: "password123",
      });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("accessToken");
    });

    it("should reject wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "testuser",
        password: "wrongpass",
      });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });
  });
});
