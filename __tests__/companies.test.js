process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let comp;

beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('TEST', 'test', 'This is a test company')
        RETURNING code, name, description`
    );
    comp = result.rows[0];
});
afterEach(async () => {
    await db.query("DELETE FROM companies");
})
afterAll(async () => {
    await db.end();
})

describe("GET /companies", () => {
    test("Get list of all companies", async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [comp] })
    })
})

describe("GET /companies/:code", () => {
    test("Get a single company by code", async () => {
        const res = await request(app).get(`/companies/${comp.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: {
            code: comp.code, 
            name: comp.name, 
            description: comp.description, 
            invoices: []
        }});
    })
})

describe("POST /companies", () => {
    test("Create a new company and add to DB", async () => {
        const res = await request(app).post('/companies')
            .send({code: "NEW", name: "new", description: "New company"});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ company: {
            code: "NEW",
            name: "new",
            description: "New company"
        }});
    })
})

describe("PUT /companies/:code", () => {
    test("Update a company's name and description", async () => {
        const res = await request(app).put(`/companies/${comp.code}`)
            .send({name: "Test", description: "UPDATED"});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: {
            code: "TEST",
            name: "Test",
            description: "UPDATED"
        }});
    })
})

describe("DELETE /companies/:code", () => {
    test("Delete a company from the DB by code", async () => {
        const res = await request(app).delete(`/companies/${comp.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    })
})