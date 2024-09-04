require("dotenv").config();
const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL);
const app = express();
app.use(express.json());

// GET
app.get("/api/flavors", async (req, res, next) => {
    try {
        const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
        const response = await client.query(SQL);
        res.send(response.rows);
    }   catch (error) {
        next(error);
    }
});

// GET by id
app.get("/api/flavors/:id", async(req, res, next) => {
    try {
        const SQL = `SELECT * from flavors WHERE id=$1`;
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows);

    }   catch (error) {
        next(error);
    }
})

// PUT
app.put('/api/flavors/:id', async(req, res, next) => {
    try {
        const SQL = `
        UPDATE flavors
        SET name=$1, updated_at=now(), is_favorite=$2
        WHERE id=$3 RETURNING *
        `;

        const response = await client.query(SQL, [
            req.body.name,
            req.body.is_favorite,
            req.params.id
        ]);
    res.send(response.rows[0]);

    } catch (error) {
        next (error)
    }
})

// DELETE
app.delete('/api/flavors/:id', async(req, res, next) => {
    try {

        const SQL = `
        DELETE from flavors
        WHERE id = $1
        `;

        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)

    } catch (error) {
        next(error);
    }
})

// POST
app.post('/api/flavors', async(req, res, next) => {
    try {
        const SQL = `
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *
        `;

    const response = await client.query(SQL, [req.body.name])
    res.send(response.rows[0]);

    } catch (error) {
        next(error)
    }
});

// Initial Data
const init = async() => {
    await client.connect();

    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        is_favorite BOOLEAN DEFAULT FALSE
    );
    INSERT INTO flavors(name, is_favorite) VALUES('vanilla', TRUE);
    INSERT INTO flavors(name) VALUES('chocolate');
    INSERT INTO flavors(name) VALUES('strawberry');
    `;

    await client.query(SQL);

    const port = process.env.PORT || 3000;
    app.listen(port)
};

init();