const refreshCookie =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTlkOGNmZDNkZGQzOGUyZDkzZjMxZTgiLCJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwicm9sZSI6IlVTRVIiLCJ2ZXJpZmllZCI6ZmFsc2UsImlhdCI6MTcwNDgyNDMxMCwibmJmIjoxNzA0ODI0MzEwLCJleHAiOjE3MDU0MjkxMTAsImF1ZCI6InVzZXIiLCJpc3MiOiJteWJsb2cifQ.L7jHFO1pHrcJP2lX9zUG8qjRUS31aSj6eUOTOXbtajU";
const fromOrigin = "http://127.0.0.1:8000";

let originalConsoleError: any;

const setupErrorSuppression = () => {
    beforeEach(() => {
        originalConsoleError = console.error;
        console.error = () => {};
    });

    after(() => {
        console.error = originalConsoleError;
    });
};

export { setupErrorSuppression, fromOrigin, refreshCookie };
