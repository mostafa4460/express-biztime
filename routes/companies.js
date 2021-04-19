const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT code, name, description
            FROM companies`
        );
        return res.json({ companies: results.rows });
    } catch(e) {
        return next(e);
    }
})

router.get('/:compCode', async (req, res, next) => {
    try {
        const { compCode } = req.params;
        const companyRes = await db.query(
            `SELECT c.code, c.name, c.description, i.field
            FROM companies AS c
            LEFT JOIN inds_comps AS ic
            ON ic.comp_code = c.code
            LEFT JOIN industries AS i
            ON ic.ind_code = i.code
            WHERE c.code = $1`,
            [compCode]
        );
        if (companyRes.rows.length === 0) throw new ExpressError(`Could not find company with code name ${compCode}`, 404);
        let { code, name, description } = companyRes.rows[0];
        let fields = companyRes.rows.map(r => r.field);
        const company = {code, name, description, fields};
        const invoicesRes = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE comp_code = $1`,
            [code]
        );
        company["invoices"] = invoicesRes.rows;
        return res.json({ company });
    } catch(e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name, {lower: true});
        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json({ company: result.rows[0] });
    } catch(e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const result = await db.query(
            `UPDATE companies SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]
        );
        if (result.rows.length === 0) throw new ExpressError(`Could not update company with code name ${code}`, 404);
        return res.json({ company: result.rows[0] });
    } catch(e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await db.query(
            `DELETE FROM companies
            WHERE code = $1
            RETURNING code, name, description`,
            [code]
        );
        if (result.rows.length === 0) throw new ExpressError(`Could not delete company with code name ${code}`, 404);
        return res.json({ status: "deleted" });
    } catch(e) {
        return next(e);
    }
})

module.exports = router;