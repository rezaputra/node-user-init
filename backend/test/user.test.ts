import assert from "assert";
import supertest from "supertest";
import app from "../src";
import { fromOrigin, refreshCookie, setupErrorSuppression } from "./testSetup";

setupErrorSuppression();

describe("User profile", function () {
    const accessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTlkOGNmZDNkZGQzOGUyZDkzZjMxZTgiLCJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwicm9sZSI6IlVTRVIiLCJ2ZXJpZmllZCI6ZmFsc2UsImlhdCI6MTcwNDgyNzg1OCwibmJmIjoxNzA0ODI3ODU4LCJleHAiOjE3MDQ4NDU4NTgsImF1ZCI6InVzZXIiLCJpc3MiOiJteWJsb2cifQ.f5LWicsot11dlpAc4ysdFlwKge0iMMFv7ASL8jQp-Kw";
    it("Should return user profile", function (done) {
        supertest(app)
            .get("/api/v1/user/")
            .set("Origin", fromOrigin)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(res.body.success, true);
                assert.ok(res.body.data, "Not empty");
                done();
            });
    });
    it("Should cannot update because user not verified", function (done) {
        const updateUser = {
            fullName: "User 1 full name",
        };
        supertest(app)
            .patch("/api/v1/user/")
            .set("Origin", fromOrigin)
            .set("Authorization", `Bearer ${accessToken}`)
            .send(updateUser)
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(res.body.success, false);
                assert.strictEqual(res.body.data, undefined);
                done();
            });
    });
});
