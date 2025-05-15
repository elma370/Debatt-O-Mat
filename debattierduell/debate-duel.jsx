
import React, { useState } from 'react';

export default function DebateDuel() {
  const [messages, setMessages] = useState([]);
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [turn, setTurn] = useState('A');
  const [feedback, setFeedback] = useState(null);

  const handleSend = async () => {
    const message = { role: turn, content: turn === 'A' ? inputA : inputB };
    const newMessages = [...messages, message];
    setMessages(newMessages);
    turn === 'A' ? setInputA('') : setInputB('');
    setTurn(turn === 'A' ? 'B' : 'A');

    if (newMessages.length >= 10) {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Debatte:\n${newMessages.map(m => m.role + ': ' + m.content).join('\n')}` })
      });
      const data = await response.json();
      setFeedback(data.result);
    }
  };

  return (
    <div>
      <h2>Debattierduell</h2>
      <div>
        {messages.map((m, i) => (
          <div key={i}><strong>{m.role}:</strong> {m.content}</div>
        ))}
      </div>
      <div>
        <input
          value={inputA}
          onChange={(e) => setInputA(e.target.value)}
          placeholder="A sagt..."
          disabled={turn !== 'A'}
        />
        <input
          value={inputB}
          onChange={(e) => setInputB(e.target.value)}
          placeholder="B sagt..."
          disabled={turn !== 'B'}
        />
        <button onClick={handleSend}>Senden</button>
      </div>
      {feedback && <div><h3>Feedback:</h3><pre>{feedback}</pre></div>}
    </div>
  );
}
