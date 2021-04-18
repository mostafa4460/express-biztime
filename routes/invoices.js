const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices`
        );
        return res.json({ invoices: results.rows });
    } catch(e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await db.query(`
            SELECT id, comp_code, amt, paid, add_date, paid_date
            FROM invoices
            WHERE id = $1`,
            [id]
        );
        if (results.rows.length === 0) throw new ExpressError(`Could not find invoice with id ${id}`, 404);
        return res.json({ invoice: results.rows[0] });
    } catch(e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );
        return res.status(201).json({ invoice: result.rows[0] });
    } catch(e) {
        return next(e);
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const result = await db.query(
            `UPDATE invoices SET amt = $1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, id]
        );
        if (result.rows.length === 0) throw new ExpressError(`Could not update invoice with id ${id}`, 404);
        return res.json({ invoice: result.rows[0] });
    } catch(e) {
        return next(e);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `DELETE FROM invoices
            WHERE id = $1
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [id]
        );
        if (result.rows.length === 0) throw new ExpressError(`Could not delete invoice with id ${id}`, 404);
        return res.json({ status: "deleted" });
    } catch(e) {
        return next(e);
    }
})

module.exports = router;