const express = require('express');
const app = express();
const { envelopes } = require('./envelopes.js');
const { console } = require('inspector');  // do wyrzucenia jak dodamy wszystkie ścieżki z db
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

 //to też do wywalenia
const findEnvelope = ('/envelopes/:id', (req, res, next) => {
    const index = envelopes.findIndex(x => x.id === parseFloat(req.params.id));
    const envelopeWanted = envelopes[index];
    if (index !== -1) {
        req.index = index;
        req.envelopeWanted = envelopeWanted;
        next();
    } else {
        res.status(404).send('Cant find given envelop');
    }
});


// get all envelopes
app.get('/envelopes', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM envelopes');
        res.status(200).json(result.rows);
    } catch (err) {
        res.send(err);
    }
});


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

/*

app.delete('/envelopes/:id', (req, res, next) => {
    if (req.envelopeWanted) {
        envelopes.splice(req.index, 1);
    res.status(200).send(`deleted envelope with id: ${req.envelopeWanted.id}`);
    } else {
        res.status(404).send(`Cant find envolope with id: ${req.envelopeWanted.id}`);
    }
});

*/



app.listen(PORT, () => {
    console.log('server is woring');
});
