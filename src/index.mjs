import _ from 'lodash'
import pg from 'pg'
import QueryStream from 'pg-query-stream'
import express from 'express'

const app = express()

app.use(express.static('public'))

app.get('/card_summary', async (req, res) => {
    const client = new pg.Client("postgres://materialize@localhost:6875/materialize")
    await client.connect()

    const query = new QueryStream('TAIL card_summary WITH (PROGRESS)', [], { batchSize: 1 })
    const stream = client.query(query)

    res.setHeader('Content-Type', 'text/event-stream')

    for await (const event of stream) {
        const row = _.omit(event, 'diff', 'timestamp', 'progressed');
        const { timestamp, progressed, diff } = event;
        const data = { timestamp, row, diff, progressed };
        res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
});

app.listen(4000);
