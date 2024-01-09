import assert from "assert";
import supertest from "supertest";
import app from "../src";
import { fromOrigin, refreshCookie, setupErrorSuppression } from "./testSetup";

setupErrorSuppression();

describe("Test token", function () {
    it("Return new access token", function (done) {
        supertest(app)
            .get("/api/v1/auth/refresh-token")
            .set("Origin", fromOrigin)
            .set("Cookie", `refreshToken=${refreshCookie}`)
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
    it("Refresh token cookie not valid", function (done) {
        supertest(app)
            .get("/api/v1/auth/refresh-token")
            .set("Origin", fromOrigin)
            .set("Cookie", `refreshToken=other token`)
            .expect(403)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                assert.strictEqual(res.body.success, false);
                assert.strictEqual(res.body.token, undefined);
                done();
            });
    });
});
