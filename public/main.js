const { useState, useEffect } = React;
const { Badge, Card, Container } = ReactBootstrap;

function App() {
    const [ cards, setCards ] = useState([]);

    useEffect(() => {
        const stream = new EventSource('/card_summary');

        let cards = [];

        stream.onmessage = (msg) => {
            const { timestamp, row, diff, progressed } = JSON.parse(msg.data);

            if (diff == 1) {
                cards = cards.concat([row]);
            } else {
                cards = cards.filter(prev_row => !_.isEqual(prev_row, row));
            }

            if (progressed) {
                cards.sort((a, b) => a.id - b.id);
                setCards(cards);
            }
        };
    }, []);

    return <Container>
        {cards.map(card => (
            <Card key={card.id} style={{ width: '300px' }}>
                {card.filepath &&
                    <Card.Img src={"http://localhost:3000/attachments/" + card.filepath} />
                }
                <Card.Body>
                    <Card.Title>{card.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">List: {card.list_name}</Card.Subtitle>
                    <Card.Text>
                        {card.description}
                    </Card.Text>
                    <Card.Text>
                        {card.labels.map(label => <Badge key={label} bg="primary">{label}</Badge>)}
                    </Card.Text>
                </Card.Body>
            </Card>
        ))}
    </Container>
}

ReactDOM.render(<App />, document.querySelector('#root'))
