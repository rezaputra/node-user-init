import assert from "assert";
import supertest from "supertest";
import app from "../src";
import { fromOrigin, setupErrorSuppression } from "./testSetup";

setupErrorSuppression();

describe("Test login", function () {
    it("Successful login", function (done) {
        const userData = {
            email: "user1@mail.com",
            password: "Strong123",
        };
        supertest(app)
            .post("/api/v1/auth/login")
            .set("Origin", fromOrigin)
            .send(userData)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(res.body.success, true);
                assert.ok(res.body.token, "Token should not be empty");

                done();
            });
    });

    it("Account not found", function (done) {
        const userData = {
            email: "unknown@mail.com",
            password: "Strong123",
        };
        supertest(app)
            .post("/api/v1/auth/login")
            .set("Origin", fromOrigin)
            .send(userData)
            .expect(404)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(res.body.success, false);

                done();
            });
    });

    it("Wrong password", function (done) {
        const userData = {
            email: "user1@mail.com",
            password: "Weak123",
        };
        supertest(app)
            .post("/api/v1/auth/login")
            .set("Origin", fromOrigin)
            .send(userData)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(res.body.success, false);
                assert.ok(res.body.message, "Wrong password");

                done();
            });
    });
});
