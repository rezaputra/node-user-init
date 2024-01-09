import supertest from "supertest";
import assert from "assert";
import app from "../src";
import { fromOrigin, setupErrorSuppression } from "./testSetup";

setupErrorSuppression();

describe("Test Register", function () {
    it("It should return validation failed", function (done) {
        const userData = {
            fullName: "",
            email: null,
            password: "trong123",
            confPassword: "Strong123",
        };
        const expectResponse = {
            success: false,
            status: 400,
            message: "Validation failed",
            additionalInfo: {
                fullName: "Full name field cannot be empty",
                email: "Email is not valid",
                password: "Weak password",
                confPassword: "Password and confirm password did not match",
            },
        };
        supertest(app)
            .post("/api/v1/auth/signup")
            .set("Origin", fromOrigin)
            .send(userData)
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                assert.deepStrictEqual(res.body, expectResponse);

                done();
            });
    });
    it("It should create a user", function (done) {
        const userData = {
            fullName: "User 1",
            email: "user1@mail.com",
            password: "Strong123",
            confPassword: "Strong123",
        };

        supertest(app)
            .post("/api/v1/auth/signup")
            .set("Origin", fromOrigin)
            .send(userData)
            .expect(201)
            .end(function (err, res) {
                if (err) return done(err);
                assert.strictEqual(res.body.success, true);
                assert.strictEqual(res.body.message, "User registered successfully");

                done();
            });
    });

    it("It should return email already taken", function (done) {
        const userData = {
            fullName: "User 1",
            email: "user1@mail.com",
            password: "Strong123",
            confPassword: "Strong123",
        };

        supertest(app)
            .post("/api/v1/auth/signup")
            .set("Origin", fromOrigin)
            .send(userData)
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                assert.strictEqual(res.body.message, "Validation failed");
                assert.strictEqual(res.body.additionalInfo.email, "Email already taken");

                done();
            });
    });
});
