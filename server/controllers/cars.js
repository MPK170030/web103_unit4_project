import { pool } from '../config/database.js';

// ===================== Options (exteriors, roofs, interiors, wheels) =====================

// The only tables these controllers may read from.
// Table names can't be passed as $1 parameters, so we whitelist them instead.
const TABLES = ['exteriors', 'roofs', 'interiors', 'wheels'];

// GET /api/:table          e.g. /api/exteriors
const getOptions = async (req, res) => {
    const { table } = req.params;
    if (!TABLES.includes(table)) {
        return res.status(404).json({ error: `Unknown option type: ${table}` });
    }

    try {
        const results = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
        res.status(200).json(results.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/:table/:id      e.g. /api/roofs/4
const getOptionById = async (req, res) => {
    const { table, id } = req.params;
    if (!TABLES.includes(table)) {
        return res.status(404).json({ error: `Unknown option type: ${table}` });
    }

    try {
        const results = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
        if (results.rows.length === 0) {
            return res.status(404).json({ error: `${table} option ${id} not found` });
        }
        res.status(200).json(results.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===================== Cars =====================

// Joins each car to its four options so the frontend gets names, images and prices.
const CAR_DETAILS_QUERY = `
    SELECT
        c.id, c.name, c.price, c.convertible,
        json_build_object('id', e.id, 'name', e.name, 'image_url', e.image_url, 'price', e.price) AS exterior,
        json_build_object('id', r.id, 'name', r.name, 'image_url', r.image_url, 'price', r.price,
                          'convertible_only', r.convertible_only) AS roof,
        json_build_object('id', i.id, 'name', i.name, 'image_url', i.image_url, 'price', i.price) AS interior,
        json_build_object('id', w.id, 'name', w.name, 'image_url', w.image_url, 'price', w.price) AS wheels
    FROM cars c
    JOIN exteriors e ON e.id = c.exterior_id
    JOIN roofs     r ON r.id = c.roof_id
    JOIN interiors i ON i.id = c.interior_id
    JOIN wheels    w ON w.id = c.wheels_id
`;

// Every car starts at this price before options (keep in sync with the frontend).
const BASE_PRICE = 65000;
const CONVERTIBLE_PRICE = 10000;

// Looks up the four chosen options, checks the roof/convertible rule,
// and returns the total price. Throws { status, message } on bad input.
const validateAndPrice = async ({ name, convertible = false, exterior_id, roof_id, interior_id, wheels_id }) => {
    if (!name || !exterior_id || !roof_id || !interior_id || !wheels_id) {
        throw { status: 400, message: 'name, exterior_id, roof_id, interior_id and wheels_id are required' };
    }

    const results = await pool.query(
        `SELECT
            (SELECT price FROM exteriors WHERE id = $1) AS exterior_price,
            (SELECT price FROM roofs     WHERE id = $2) AS roof_price,
            (SELECT convertible_only FROM roofs WHERE id = $2) AS roof_convertible_only,
            (SELECT price FROM interiors WHERE id = $3) AS interior_price,
            (SELECT price FROM wheels    WHERE id = $4) AS wheels_price`,
        [exterior_id, roof_id, interior_id, wheels_id]
    );
    const p = results.rows[0];

    for (const part of ['exterior', 'roof', 'interior', 'wheels']) {
        if (p[`${part}_price`] === null) {
            throw { status: 400, message: `Invalid ${part}_id` };
        }
    }
    if (p.roof_convertible_only && !convertible) {
        throw { status: 400, message: 'That roof is only available on convertibles' };
    }

    return BASE_PRICE + (convertible ? CONVERTIBLE_PRICE : 0) + p.exterior_price + p.roof_price + p.interior_price + p.wheels_price;
};

// GET /api/cars
const getCars = async (req, res) => {
    try {
        const results = await pool.query(`${CAR_DETAILS_QUERY} ORDER BY c.id`);
        res.status(200).json(results.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/cars/:id
const getCarById = async (req, res) => {
    try {
        const results = await pool.query(`${CAR_DETAILS_QUERY} WHERE c.id = $1`, [req.params.id]);
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json(results.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/cars
// body: { name, convertible, exterior_id, roof_id, interior_id, wheels_id }
// Price is calculated here, never taken from the client.
const createCar = async (req, res) => {
    try {
        const price = await validateAndPrice(req.body);
        const { name, convertible = false, exterior_id, roof_id, interior_id, wheels_id } = req.body;

        const results = await pool.query(
            `INSERT INTO cars (name, price, convertible, exterior_id, roof_id, interior_id, wheels_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, price, convertible, exterior_id, roof_id, interior_id, wheels_id]
        );
        res.status(201).json(results.rows[0]);
    } catch (error) {
        res.status(error.status ?? 500).json({ error: error.message });
    }
};

// PATCH /api/cars/:id
// body: same fields as create (send the full car)
const updateCar = async (req, res) => {
    try {
        const price = await validateAndPrice(req.body);
        const { name, convertible = false, exterior_id, roof_id, interior_id, wheels_id } = req.body;

        const results = await pool.query(
            `UPDATE cars
             SET name = $1, price = $2, convertible = $3,
                 exterior_id = $4, roof_id = $5, interior_id = $6, wheels_id = $7
             WHERE id = $8
             RETURNING *`,
            [name, price, convertible, exterior_id, roof_id, interior_id, wheels_id, req.params.id]
        );
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json(results.rows[0]);
    } catch (error) {
        res.status(error.status ?? 500).json({ error: error.message });
    }
};

// DELETE /api/cars/:id
const deleteCar = async (req, res) => {
    try {
        const results = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [req.params.id]);
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.status(200).json(results.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getOptions,
    getOptionById,
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};