
import { useState } from 'react';

export default function Home() {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [messages, setMessages] = useState([]);
  const [turn, setTurn] = useState('A');
  const [feedback, setFeedback] = useState(null);
  const [started, setStarted] = useState(false);

  const handleSend = async () => {
    const message = {
      role: turn,
      name: turn === 'A' ? nameA : nameB,
      content: turn === 'A' ? inputA : inputB,
    };
    const updated = [...messages, message];
    setMessages(updated);
    turn === 'A' ? setInputA('') : setInputB('');
    setTurn(turn === 'A' ? 'B' : 'A');

    if (updated.length >= 10) {
      const debateText = updated.map(m => `${m.name}: ${m.content}`).join('\n');
      const prompt = `Zwei Personen haben eine Debatte geführt. Analysiere Gesprächsstil, Argumentation und Umgang miteinander. Gib beiden Feedback, benenne Stärken und Schwächen, und vergebe je 5 Kategorien Punkte von 1 bis 5.\n\nDebatte:\n${debateText}`;

      const res = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      setFeedback(data.result);
    }
  };

  if (!started) {
    return (
      <div style={{ padding: 20 }}>
        <h1>🎤 Debattierduell</h1>
        <p>Gib die Namen beider Personen ein:</p>
        <input placeholder="Name A" value={nameA} onChange={e => setNameA(e.target.value)} />
        <input placeholder="Name B" value={nameB} onChange={e => setNameB(e.target.value)} />
        <button onClick={() => setStarted(true)} disabled={!nameA || !nameB}>Starten</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Debattierduell zwischen {nameA} & {nameB}</h2>
      <div style={{ marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i}><strong>{m.name}:</strong> {m.content}</div>
        ))}
      </div>
      {!feedback && (
        <>
          <div>
            <input
              placeholder={`${nameA} sagt...`}
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              disabled={turn !== 'A'}
            />
            <input
              placeholder={`${nameB} sagt...`}
              value={inputB}
              onChange={(e) => setInputB(e.target.value)}
              disabled={turn !== 'B'}
            />
          </div>
          <button onClick={handleSend}>Senden</button>
        </>
      )}
      {feedback && (
        <div style={{ marginTop: 20 }}>
          <h3>🧠 GPT-Feedback</h3>
          <pre>{feedback}</pre>
        </div>
      )}
    </div>
  );
}
