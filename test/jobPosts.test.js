require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");

const app = require("../src/app");
const mongoose = require("mongoose");
const User = require("../src/models/User");
const JobPost = require("../src/models/JobPost");
const CompanyProfile = require("../src/models/CompanyProfile");
const { faker } = require("@faker-js/faker");

describe("Job Posts API", () => {
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

  beforeEach(async () => {
    await User.deleteMany({});
    await CompanyProfile.deleteMany({});
    await JobPost.deleteMany({});

    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await User.create({
      username: "companyUser",
      passwordHash,
      role: "Company",
    });

    const companyProfile = await CompanyProfile.create({
      name: "Test Company",
      description: "A test company",
      user: user._id,
    });

    user.companyProfile = companyProfile._id;
    await user.save();

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
      .send({ username: "companyUser", password: "password123" });

    companyToken = res.body.accessToken;
  });

  describe("GET /api/job-posts", () => {
    it("should list all logged in company's job posts", async () => {
      const res = await request(app)
        .get("/api/job-posts")
        .set("Authorization", `Bearer ${companyToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.equal(5);
      res.body.forEach((jobPost) => {
        expect(jobPost).to.have.property("title");
        expect(jobPost).to.have.property("slug");
        expect(jobPost).to.have.property("description");
        expect(jobPost).to.have.property("updatedAt");
        expect(jobPost).to.have.property("publishedAt");
      });
    });

    it("should return an empty array if no job posts exist", async () => {
      await JobPost.deleteMany({});

      const res = await request(app)
        .get("/api/job-posts")
        .set("Authorization", `Bearer ${companyToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array").that.is.empty;
    });
  });

  describe("GET /api/job-posts without authorization", () => {
    it("should return 401 Unauthorized if no token is provided", async () => {
      const res = await request(app).get("/api/job-posts");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Unauthorized");
    });

    it("should return 401 Unauthorized if invalid token is provided", async () => {
      const res = await request(app)
        .get("/api/job-posts")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Invalid token");
    });
  });

  describe("POST /api/job-posts", () => {
    it("should create a new job post", async () => {
      const newJobPost = {
        title: "New Job Post",
        slug: "new-job-post",
        description: "This is a new job post",
        publishNow: false,
      };

      const res = await request(app)
        .post("/api/job-posts")
        .set("Authorization", `Bearer ${companyToken}`)
        .send(newJobPost);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("title", newJobPost.title);
      expect(res.body).to.have.property("description", newJobPost.description);
      expect(res.body).to.have.property("companyProfile");
    });

    it("should return 422 if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/job-posts")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({});

      expect(res.status).to.equal(422);
      expect(res.body).to.have.property("errors").that.is.an("array");

      // Check that each expected error message is present
      const messages = res.body.errors.map((e) => e.message);
      expect(messages).to.include("Title is required");
      expect(messages).to.include("Description is required");
      expect(messages).to.include("'Publish Now?' is required");
    });
  });

  describe("POST /api/job-posts without authorization", () => {
    it("should return 401 Unauthorized if no token is provided", async () => {
      const res = await request(app).post("/api/job-posts").send({
        title: "Unauthorized Job Post",
        description: "This should not be created",
      });
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Unauthorized");
    });

    it("should return 401 Unauthorized if invalid token is provided", async () => {
      const res = await request(app)
        .post("/api/job-posts")
        .set("Authorization", "Bearer invalidtoken")
        .send({
          title: "Invalid Token Job Post",
          description: "This should not be created",
        });
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Invalid token");
    });
  });

  describe("GET /api/job-posts/:id", () => {
    it("should return a specific job post by ID", async () => {
      const jobPost = await JobPost.findOne();

      const res = await request(app)
        .get(`/api/job-posts/${jobPost.id}`)
        .set("Authorization", `Bearer ${companyToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("title", jobPost.title);
      expect(res.body).to.have.property("description", jobPost.description);
      expect(res.body).to.have.property("companyProfile");
    });

    it("should return 404 if job post not found", async () => {
      const res = await request(app)
        .get("/api/job-posts/999")
        .set("Authorization", `Bearer ${companyToken}`);

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Job post not found");
    });
  });

  describe("GET /api/job-posts/:id without authorization", () => {
    it("should return 401 Unauthorized if no token is provided", async () => {
      const res = await request(app).get("/api/job-posts/1");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Unauthorized");
    });

    it("should return 401 Unauthorized if invalid token is provided", async () => {
      const res = await request(app)
        .get("/api/job-posts/1")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Invalid token");
    });
  });

  describe("PUT /api/job-posts/:id", () => {
    it("should update a job post", async () => {
      const jobPost = await JobPost.findOne();
      const updatedData = {
        title: "Updated Job Post",
        description: "This job post has been updated",
      };

      const res = await request(app)
        .put(`/api/job-posts/${jobPost.id}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .send(updatedData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("title", updatedData.title);
      expect(res.body).to.have.property("description", updatedData.description);
    });

    it("should return 404 if job post not found", async () => {
      const res = await request(app)
        .put("/api/job-posts/999")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          title: "Non-existent Job Post",
          description: "This job post does not exist",
        });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Job post not found");
    });

    it("should return 401 Unauthorized if invalid token is provided", async () => {
      const jobPost = await JobPost.findOne();

      const res = await request(app)
        .put(`/api/job-posts/${jobPost.id}`)
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Invalid token");
    });
  });

  describe("DELETE /api/job-posts/:id", () => {
    it("should delete a job post", async () => {
      const jobPost = await JobPost.findOne();

      const res = await request(app)
        .delete(`/api/job-posts/${jobPost.id}`)
        .set("Authorization", `Bearer ${companyToken}`)
        .send();

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message", "Job post deleted successfully");
    })

    it("should return 404 if job post not found", async () => {
      const res = await request(app)
        .delete("/api/job-posts/999")
        .set("Authorization", `Bearer ${companyToken}`)
        .send({
          title: "Non-existent Job Post",
          description: "This job post does not exist",
        });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.equal("Job post not found");
    });

    it("should return 401 Unauthorized if invalid token is provided", async () => {
      const jobPost = await JobPost.findOne();

      const res = await request(app)
        .delete(`/api/job-posts/${jobPost.id}`)
        .set("Authorization", "Bearer invalidtoken");
      expect(res.status).to.equal(401);
      expect(res.body.error).to.equal("Invalid token");
    });
  })
});
