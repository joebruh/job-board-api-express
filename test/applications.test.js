require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");

const app = require("../src/app");
const mongoose = require("mongoose");
const Application = require("../src/models/Application");
const User = require("../src/models/User");
const JobPost = require("../src/models/JobPost");
const CompanyProfile = require("../src/models/CompanyProfile");
const CandidateProfile = require("../src/models/CandidateProfile");
const { faker } = require("@faker-js/faker");

describe("Applications API", () => {
  before(async () => {
    await mongoose.connect(
      "mongodb://mongoadmin:secretpassword@localhost:27017/jobboard_test",
      {
        authSource: "admin",
      }
    );
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("POST /api/job-application/:id", () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await CandidateProfile.deleteMany({});
      await CompanyProfile.deleteMany({});
      await JobPost.deleteMany({});

      const bcrypt = require("bcryptjs");
      const candidatePasswordHash = await bcrypt.hash("password123", 10);
      const candidateUser = await User.create({
        username: "candidateUser",
        passwordHash: candidatePasswordHash,
        role: "Candidate",
      });

      const candidateProfile = await CandidateProfile.create({
        name: "Test Candidate",
        email: "test-candidate@example.com",
        phone: "1234567890",
        user: candidateUser._id,
      });

      candidateUser.candidateProfile = candidateProfile._id;
      await candidateUser.save();

      const companyPasswordHash = await bcrypt.hash("password123", 10);
      const companyUser = await User.create({
        username: "companyUser",
        passwordHash: companyPasswordHash,
        role: "Company",
      });

      const companyProfile = await CompanyProfile.create({
        name: "Test Company",
        description: "A test company",
        user: companyUser._id,
      });

      companyUser.companyProfile = companyProfile._id;
      await companyUser.save();

      const jobPosts = Array.from({ length: 5 }).map((_, i) => {
        const title = faker.person.jobTitle();
        return {
          id: i + 1,
          title,
          slug: faker.helpers.slugify(title),
          description: faker.lorem.paragraph(),
          companyProfile: companyProfile._id,
          publishedAt: faker.date.recent(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        };
      });

      await JobPost.insertMany(jobPosts);

      // get JWT token
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "candidateUser", password: "password123" });

      candidateToken = res.body.accessToken;
    });

    it("should let candidate send a valid application to an existing job post", async () => {
      const jobPost = await JobPost.findOne();
      const data = {
        resumeLink: faker.internet.url(),
        coverLetter: faker.lorem.paragraph(),
      };

      const res = await request(app)
        .post(`/api/job-application/${jobPost.id}`)
        .set("Authorization", `Bearer ${candidateToken}`)
        .send(data);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property(
        "message",
        "Application sent successfully"
      );
    });

    it("should not let candidate send an application to nonexistent job post", async () => {
      const res = await request(app)
        .post("/api/job-application/999")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send({
          resumeLink: faker.internet.url(),
          coverLetter: faker.lorem.paragraph(),
        });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Job post not found");
    });

    it("not allow company to send an application", async () => {
      const jobPost = await JobPost.findOne();

      // get JWT token
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ username: "companyUser", password: "password123" });

      companyToken = loginRes.body.accessToken;

      const res = await request(app)
        .post(`/api/job-application/${jobPost.id}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          resumeLink: faker.internet.url(),
          coverLetter: faker.lorem.paragraph(),
        });

      expect(res.status).to.equal(403);
      expect(res.body.error).to.equal("Forbidden");
    });
  });

  describe("GET /api/view-application/:id", () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await CandidateProfile.deleteMany({});
      await CompanyProfile.deleteMany({});
      await JobPost.deleteMany({});
      await Application.deleteMany({});

      const bcrypt = require("bcryptjs");
      const companyPasswordHash = await bcrypt.hash("password123", 10);
      companyUser = await User.create({
        username: "companyUser",
        passwordHash: companyPasswordHash,
        role: "Company",
      });

      const companyProfile = await CompanyProfile.create({
        name: "Test Company",
        description: "A test company",
        user: companyUser._id,
      });

      companyUser.companyProfile = companyProfile._id;
      await companyUser.save();

      const jobPostsRaw = Array.from({ length: 5 }).map((_, i) => {
        const title = faker.person.jobTitle();
        return {
          id: i + 1,
          title,
          slug: faker.helpers.slugify(title),
          description: faker.lorem.paragraph(),
          companyProfile: companyProfile._id,
          publishedAt: faker.date.recent(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        };
      });

      const jobPosts = await JobPost.insertMany(jobPostsRaw);

      const candidatePasswordHash = await bcrypt.hash("password123", 10);
      candidateUser = await User.create({
        username: "candidateUser",
        passwordHash: candidatePasswordHash,
        role: "Candidate",
      });

      const candidateProfile = await CandidateProfile.create({
        name: "Test Candidate",
        email: "test-candidate@example.com",
        phone: "1234567890",
        user: candidateUser._id,
      });

      candidateUser.candidateProfile = candidateProfile._id;
      await candidateUser.save();

      const applications = Array.from({ length: 5 }).map((_, i) => {
        return {
          id: i + 1,
          resumeLink: faker.internet.url(),
          coverLetter: faker.lorem.paragraph(),
          createdAt: faker.date.recent(),
          candidateProfile: candidateProfile._id,
          jobPost: jobPosts[i % jobPosts.length]._id,
        };
      });

      await Application.insertMany(applications);
    });

    it("should allow company to view application", async () => {
      // get JWT token
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ username: "companyUser", password: "password123" });

      companyToken = loginRes.body.accessToken;

      const application = await Application.findOne().populate({
        path: "jobPost",
        match: { companyProfile: companyUser.companyProfile },
      });

      const res = await request(app)
        .get(`/api/view-application/${application.id}`)
        .set("Authorization", `Bearer ${companyToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("resumeLink");
      expect(res.body).to.have.property("coverLetter");
      expect(res.body).to.have.property("status");
    });

    it("should allow a candidate to view their application", async () => {
      // get JWT token
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ username: "companyUser", password: "password123" });

      candidateToken = loginRes.body.accessToken;

      const application = await Application.findOne({
        candidateProfile: candidateUser.candidateProfile._id,
      });

      const res = await request(app)
        .get(`/api/view-application/${application.id}`)
        .set("Authorization", `Bearer ${candidateToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("resumeLink");
      expect(res.body).to.have.property("coverLetter");
      expect(res.body).to.have.property("status");
    });
  });
});
