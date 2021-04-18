process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let comp;
let inv;

beforeAll(async () => {
    const compRes = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('TEST', 'test', 'This is a test company')
        RETURNING code, name, description`
    );
    comp = compRes.rows[0];
})
beforeEach(async () => {
    const invRes = await db.query(
        `INSERT INTO invoices (comp_code, amt)
        VALUES ('TEST', '99')
        RETURNING id, comp_code, amt, paid, add_date, paid_date`
    );
    inv = invRes.rows[0];
});
afterEach(async () => {
    await db.query("DELETE FROM invoices");
})
afterAll(async () => {
    await db.query("DELETE FROM companies");
    await db.end();
})

describe("GET /invoices", () => {
    test("Get list of all invoices", async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [{
            add_date: expect.any(String),
            amt: inv.amt,
            comp_code: comp.code,
            id: inv.id,
            paid: inv.paid,
            paid_date: inv.paid_date
        }]})
    })
})

describe("GET /companies/:id", () => {
    test("Get a single invoice by id", async () => {
        const res = await request(app).get(`/invoices/${inv.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: {
            add_date: expect.any(String),
            amt: inv.amt,
            comp_code: comp.code,
            id: inv.id,
            paid: inv.paid,
            paid_date: inv.paid_date
        }});
    })
})

describe("POST /invoices", () => {
    test("Create a new invoice and add to DB", async () => {
        const res = await request(app).post('/invoices')
            .send({comp_code: "TEST", amt: 150});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ invoice: {
            add_date: expect.any(String),
            amt: 150,
            comp_code: comp.code,
            id: expect.any(Number),
            paid: false,
            paid_date: null
        }});
    })
})

describe("PUT /invoices/:id", () => {
    test("Update an invoice amount", async () => {
        const res = await request(app).put(`/invoices/${inv.id}`)
            .send({amt: 55});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: {
            add_date: expect.any(String),
            amt: 55,
            comp_code: comp.code,
            id: inv.id,
            paid: inv.paid,
            paid_date: inv.paid_date
        }});
    })
})

describe("DELETE /invoices/:id", () => {
    test("Delete an invoice from the DB by id", async () => {
        const res = await request(app).delete(`/invoices/${inv.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    })
})