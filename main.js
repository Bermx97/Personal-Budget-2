const express = require('express');
const app = express();
const { console } = require('inspector');
require('dotenv').config();
const { Pool } = require('pg');
const { randomFillSync } = require('crypto');



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});


const PORT = process.env.PORT || 3100;
app.use(express.json());


app.get('/', (req, res, next) => {
    res.status(200).send('welcome')
})



// get all envelopes
app.get('/envelopes', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM envelopes ORDER BY id');
        res.status(200).json(result.rows);
    } catch (err) {
        res.send(err);
    }
});

// get all transactions history
app.get('/envelopes/transactions', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY id');
        res.status(200).json(result.rows);
    } catch (err) {
        res.send(err);
    }
});

// get transactions history by id
app.get('/envelopes/transactions/:id', async (req, res, next) => {
    const envelopeId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM transactions WHERE from_id = $1 OR to_id = $1 ORDER BY from_id' , [envelopeId]);
        if (result.rows.length === 0) {
            res.status(400).json({ error: 'Envelope history not found' })
        } res.status(200).json(result.rows)
    } catch (err) {
        res.status(500).send(err);
    }
})






// get single envelope by id
app.get('/envelopes/:id', async (req, res, next) => {
    const envelopeId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM envelopes WHERE id = $1', [envelopeId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Envelope not found' });
        }
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send(err);
    }
});


// it is responsible for adding new envelope
app.post('/envelopes', async (req, res, next) => {
    const { id, category, balance } = req.body;
    const result = await pool.query('INSERT INTO envelopes VALUES ($1, $2, $3) RETURNING *', [id, category, balance]);
    res.status(200).json({ 
        message: 'New envelope added',
        result: result.rows[0]
     })
});


// it is responsible for the transactions
app.patch('/envelopes/operation/:id', async (req, res, next) => {
    const envelopeId = req.params.id;
    const { operation, amount } = req.body;
    const floatAmount = parseFloat(amount);
    if (Number(amount)) {
        switch (operation) {
            case '=':
                await pool.query('UPDATE envelopes SET balance = $1 WHERE id = $2', [floatAmount, envelopeId]);
                break;
            case '-':
                await pool.query('UPDATE envelopes SET balance = balance - $1 WHERE id = $2', [floatAmount, envelopeId]);
                break;
            case '+':
                await pool.query('UPDATE envelopes SET balance = balance + $1 WHERE id = $2', [floatAmount, envelopeId]);
                break;
            default:
                res.status(400).send('Unknown operation');
        } const balance = await pool.query('SELECT balance FROM envelopes WHERE id = $1', [envelopeId]);
          res.status(200).json({
            message: 'Your new balance',
            balance: balance.rows[0].balance
          });
    } else {
        res.status(400).send('Invalid input');
    }
});



// it is responsible for the transfer
app.post('/envelopes/transfer', async (req, res, next) => {
    const { amount, from, to } = req.body;
    if (!amount || isNaN(amount), amount <= 0) {
        return res.status(400).json({ error: 'Incorrect amount' })
    }
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const fromResult = await pool.query('UPDATE envelopes SET balance = balance - $1 WHERE id = $2 RETURNING *', [amount, from]);
        if (fromResult.rows.length === 0) {
            throw new Error('Source envelope not found')
        }
        if (fromResult.rows[0].balance < 0) {
            throw new Error('Insufficient funds in the account')
        }
        const toResult = await pool.query('UPDATE envelopes SET balance = balance + $1 WHERE id = $2 RETURNING *', [amount, to]);
        if (toResult.rows.length === 0) {
            throw new Error('Target envelope not found')
        }
        await pool.query('INSERT INTO transactions (amount, from_id, to_id) VALUES ($1, $2, $3)', [amount, from, to]);
        await client.query('COMMIT');

        res.status(200).json({
            message: 'Transfer completed successfully',
            from: fromResult.rows[0],
            to: toResult.rows[0]
          });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


// it is responsible for removing by envelope id
app.delete('/envelopes/:id', async (req, res, next) => {
    try {
        const envelopeId = req.params.id;
        const result = await pool.query('DELETE FROM envelopes WHERE id = $1 RETURNING *', [envelopeId])
        if (result.rows.length === 0) {
            throw new Error("A letter with this id doesn`t exist");
        }
        res.status(200).json(`Envelope with id: ${envelopeId} has been removed`);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});




app.listen(PORT, () => {
    console.log('server is woring');
});
