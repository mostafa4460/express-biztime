const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    try {
        const industryRes = await db.query(
            `SELECT i.code, i.field, ic.comp_Code
            FROM industries AS i
            LEFT JOIN inds_comps AS ic
            ON ic.ind_code = i.code`
        );
        return res.json({ industries: industryRes.rows });
    } catch(e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const { code, field } = req.body;
        const result = await db.query(
            `INSERT INTO industries (code, field)
            VALUES ($1, $2)
            RETURNING code, field`,
            [code, field]
        );
        return res.status(201).json({ industry: result.rows[0] });
    } catch(e) {
        return next(e);
    }
})

router.post('/:indCode/companies/:compCode', async (req, res, next) => {
    try {
        const {indCode, compCode} = req.params;
        const result = await db.query(
            `INSERT INTO inds_comps (comp_code, ind_code)
            VALUES ($1, $2)
            RETURNING comp_code, ind_code`,
            [compCode, indCode]
        );
        return res.status(201).json({ industryCompany: result.rows[0] });
    } catch (e) {
        return next(e);
    }
})

module.exports = router;