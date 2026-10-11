import './dotenv.js';
import { pool } from "./database.js";
import { exteriors, roofs, wheels, interiors } from '../data/cars_data.js'

const createExteriorsQuery = async () => {
    const createQuery = `
        DROP TABLE IF EXISTS exteriors CASCADE;

        CREATE TABLE exteriors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            image_url VARCHAR(255) NOT NULL,
            price INT NOT NULL
        );
    `;
    await pool.query(createQuery);
    console.log("exteriors table created");
}

const createRoofsQuery = async () => {
    const createQuery = `
        DROP TABLE IF EXISTS roofs CASCADE;

        CREATE TABLE roofs (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            image_url VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            convertible_only BOOLEAN NOT NULL DEFAULT FALSE
        );
    `;
    await pool.query(createQuery);
    console.log("roofs table created");
}

const createInteriorsQuery = async () => {
    const createQuery = `
        DROP TABLE IF EXISTS interiors CASCADE;

        CREATE TABLE interiors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            image_url VARCHAR(255) NOT NULL,
            price INT NOT NULL
        );
    `;
    await pool.query(createQuery);
    console.log("interiors table created");
}

const createWheelsQuery = async () => {
    const createQuery = `
        DROP TABLE IF EXISTS wheels CASCADE;

        CREATE TABLE wheels (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            image_url VARCHAR(255) NOT NULL,
            price INT NOT NULL
        );
    `;
    await pool.query(createQuery);
    console.log("wheels table created");
}

const createCarsTable = async() => {
    const createQuery = `
        DROP TABLE IF EXISTS cars;

        CREATE TABLE IF NOT EXISTS cars(
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            convertible BOOLEAN NOT NULL DEFAULT FALSE,
            exterior_id INT NOT NULL,
            wheels_id INT NOT NULL,
            roof_id INT NOT NULL,
            interior_id INT NOT NULL,
            FOREIGN KEY (exterior_id) REFERENCES exteriors(id),
            FOREIGN KEY (wheels_id) REFERENCES wheels(id),
            FOREIGN KEY (roof_id) REFERENCES roofs(id),
            FOREIGN KEY (interior_id) REFERENCES interiors(id)
        );
    `;
    await pool.query(createQuery);
    console.log("cars table created");
}

const seedTable = async (table, rows) => {
    for (const row of rows) {
        const columns = Object.keys(row);      
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');  // $1, $2, $3

        await pool.query(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
            values
        );
    }
    console.log(`seeded ${table} (${rows.length} rows)`);
};

const reset = async () => {
    try {
        await createExteriorsQuery();
        await createRoofsQuery();
        await createInteriorsQuery();
        await createWheelsQuery();
        await createCarsTable();
        await seedTable('exteriors', exteriors);
        await seedTable('roofs', roofs);
        await seedTable('wheels', wheels);
        await seedTable('interiors', interiors);
    } catch (err) {
        console.error('reset failed:', err);
    } finally {
        await pool.end();
    }
};

reset();