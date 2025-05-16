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

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 mt-10">
        {!started ? (
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">🎤 Debattierduell</h1>
            <p className="mb-4 text-sm text-gray-600">Gib die Namen beider Personen ein, um zu starten:</p>
            <div className="flex gap-4 mb-4">
              <input className="px-4 py-2 border rounded-md" placeholder="Name A" value={nameA} onChange={e => setNameA(e.target.value)} />
              <input className="px-4 py-2 border rounded-md" placeholder="Name B" value={nameB} onChange={e => setNameB(e.target.value)} />
            </div>
            <button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800" onClick={() => setStarted(true)} disabled={!nameA || !nameB}>Starten</button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-center mb-6">Debatte zwischen {nameA} & {nameB}</h2>

            <div className="space-y-3 mb-6 h-64 overflow-y-auto border p-3 rounded-md bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border shadow-sm">
                  <strong>{m.name}:</strong> {m.content}
                </div>
              ))}
            </div>

            {!feedback && (
              <div className="flex flex-col gap-3 mb-6">
                <input
                  className="px-4 py-2 border rounded-md"
                  placeholder={`${nameA} sagt...`}
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  disabled={turn !== 'A'}
                />
                <input
                  className="px-4 py-2 border rounded-md"
                  placeholder={`${nameB} sagt...`}
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  disabled={turn !== 'B'}
                />
                <button className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800" onClick={handleSend}>Senden</button>
              </div>
            )}

            {feedback && (
              <div className="bg-yellow-100 p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-2">🧠 GPT-Feedback</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-800">{feedback}</p>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="mt-10 text-xs text-gray-500">
        {new Date().toLocaleDateString('de-DE')} — Gegenüber
      </footer>
    </div>
  );
}
