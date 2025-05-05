const express = require('express');
const app = express();
const { envelopes } = require('./envelopes.js');
const { console } = require('inspector');

const PORT = 3100;

app.use(express.json())

app.get('/', (req, res, next) => {
    res.status(200).send('welcome')
})


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

app.get('/envelopes', (req, res, nest) => {
    res.send(envelopes);
});

app.get('/envelopes/:id',findEnvelope, (req, res, next) => {
   res.status(200).send(req.envelopeWanted);
});

app.post('/envelopes/:id',findEnvelope, (req, res, next) => {
    res.status(200).send(req.envelopeWanted);
});

app.post('/envelopes/:id/:operation/:value',findEnvelope, (req, res, next) => {
    const operation = req.params.operation;
    const value = req.params.value;
    const floatValue = parseFloat(req.params.value);
    if (Number(value)) {
        switch (operation) {
            case '=':
                req.envelopeWanted.limit = floatValue;
                break;
            case '-':
                req.envelopeWanted.limit -= floatValue;
                break;
            case '+':
                req.envelopeWanted.limit += floatValue;
                break;
            default:
                res.status(400).send('Invalid input');
        } res.status(200).send(`Your new limit for ${req.envelopeWanted.category}: ${req.envelopeWanted.limit}`);
    } else {
        res.status(400).send('Invalid input');
    }
});

app.post('/envelopes/transfer/:amount/:from/:to', (req, res, send) => {
    const amount = req.params.amount;
    const floatAmount = parseFloat(amount);
    const fromIndex = envelopes.findIndex(x => x.id === parseFloat(req.params.from));
    const fromEnvelopeWanted = envelopes[fromIndex];
    const toIndex = envelopes.findIndex(x => x.id === parseFloat(req.params.to));
    const toEnvelopeWanted = envelopes[toIndex];
    if (fromIndex !== -1 && toIndex !== -1) {
        if (Number(amount)) {
            fromEnvelopeWanted.limit -= floatAmount;
            toEnvelopeWanted.limit += floatAmount;
            res.status(200).send(`$transfer: ${amount} from envelope '${fromEnvelopeWanted.category}' to envelope '${toEnvelopeWanted.category}' was successful`);
        } else {
            res.status(400).send('Invalid input');
        }       
    } else {
        res.status(404).send('Cant find given envelope');
    }
});

app.delete('/envelopes/:id', (req, res, next) => {
    if (req.envelopeWanted) {
        envelopes.splice(req.index, 1);
    res.status(200).send(`deleted envelope with id: ${req.envelopeWanted.id}`);
    } else {
        res.status(404).send(`Cant find envolope with id: ${req.envelopeWanted.id}`);
    }
});





app.listen(PORT, () => {
    console.log('server is woring');
});
