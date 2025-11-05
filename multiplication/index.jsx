import React, { useState, useEffect } from "react";

// Multiplication App for kids
// Single-file React component (Tailwind CSS assumed available)

export default function MultiplicationApp() {
  const [mode, setMode] = useState("learn"); // learn | quiz
  const [table, setTable] = useState(2); // which times table to focus on
  const [maxFactor, setMaxFactor] = useState(10); // second factor max (1..12)
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [showHints, setShowHints] = useState(true);
  const [starCount, setStarCount] = useState(0);
  const [childrenName, setChildrenName] = useState("");

  useEffect(() => {
    // initialize simple questions for quiz mode
    if (mode === "quiz") {
      startQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) u.voice = voices.find(v => v.lang.startsWith('vi')) || voices[0];
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function buildTimesTable(n, upto = 10) {
    const rows = [];
    for (let i = 1; i <= upto; i++) rows.push({ a: n, b: i, product: n * i });
    return rows;
  }

  function startQuiz() {
    const qs = [];
    for (let i = 0; i < questionCount; i++) {
      const b = Math.floor(Math.random() * maxFactor) + 1;
      qs.push({ a: table, b, product: table * b, id: `${table}x${b}-${i}` });
    }
    setQuestions(qs);
    setCurrent(0);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setStarCount(0);
  }

  function checkAnswer(userAnswer) {
    const q = questions[current];
    const correct = Number(userAnswer) === q.product;
    setFeedback(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => s + 1);
      setStarCount(s => s + 1);
      // small celebration voice
      speak("Rất tốt! Đúng rồi!");
    } else {
      speak(`Không đúng. ${q.a} nhân ${q.b} bằng ${q.product}`);
    }
    // auto-move to next after short delay
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
        setAnswer("");
        setFeedback(null);
      } else {
        // finished
        speak(`Bạn trả lời đúng ${score + (correct ? 1 : 0)} trên ${questions.length} câu. Tốt lắm!`);
        setMode("result");
      }
    }, 900);
  }

  function makeChoices(q) {
    // returns array of 4 choices including the correct answer
    const correct = q.product;
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const delta = Math.floor(Math.random() * 10) - 5;
      const val = Math.max(0, correct + delta * (Math.floor(Math.random() * 3) + 1));
      choices.add(val);
    }
    return shuffle(Array.from(choices));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // small UI pieces
  const times = buildTimesTable(table, maxFactor);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-rose-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ứng dụng Toán Nhân cho Trẻ</h1>
          <div className="text-sm text-slate-600">Dễ — Vui — Thực hành</div>
        </header>

        <section className="bg-white rounded-2xl p-5 shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm">Chọn bảng:</label>
              <select
                value={table}
                onChange={e => setTable(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>

              <label className="text-sm">Tới:</label>
              <select
                value={maxFactor}
                onChange={e => setMaxFactor(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`px-4 py-2 rounded-lg font-medium ${mode === 'learn' ? 'bg-amber-400 text-white' : 'bg-stone-100'}`}
                onClick={() => setMode('learn')}
              >
                Học
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${mode === 'quiz' ? 'bg-emerald-400 text-white' : 'bg-stone-100'}`}
                onClick={() => setMode('quiz')}
              >
                Luyện
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${mode === 'result' ? 'bg-violet-400 text-white' : 'bg-stone-100'}`}
                onClick={() => { setMode('result'); }}
              >
                Kết quả
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-1 md:col-span-2">
              <div className="rounded-lg border p-3">
                <h3 className="font-semibold">Bảng {table} (1 đến {maxFactor})</h3>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {times.map(t => (
                    <div key={t.b} className="p-2 rounded-lg bg-slate-50 border flex flex-col items-center">
                      <div className="text-lg font-bold">{t.a} × {t.b}</div>
                      <button
                        onClick={() => speak(`${t.a} nhân ${t.b} bằng ${t.product}`)}
                        className="mt-2 px-2 py-1 rounded-md border text-sm"
                        aria-label={`Nghe ${t.a} nhân ${t.b}`}
                      >
                        🔈 Nghe đáp
                      </button>
                      {showHints && (
                        <div className="mt-2 text-sm text-slate-600">={t.product}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="p-3 rounded-lg border bg-white">
              <div className="mb-3">
                <label className="text-sm">Tên bé (tuỳ chọn):</label>
                <input value={childrenName} onChange={e => setChildrenName(e.target.value)} placeholder="Ví dụ: An"
                  className="w-full mt-1 px-3 py-2 border rounded-lg" />
              </div>

              <div className="mb-3">
                <label className="text-sm">Số câu luyện:</label>
                <input type="number" value={questionCount} onChange={e => setQuestionCount(Number(e.target.value))}
                  min={1} max={50} className="w-full mt-1 px-3 py-2 border rounded-lg" />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Hiện gợi ý (kết quả):</label>
                <input type="checkbox" checked={showHints} onChange={e => setShowHints(e.target.checked)} />
              </div>

              <div className="mt-3">
                <button onClick={() => { setMode('quiz'); startQuiz(); }} className="w-full py-2 rounded-lg bg-blue-500 text-white font-semibold">Bắt đầu luyện</button>
              </div>

            </aside>
          </div>
        </section>

        {/* Main area */}
        {mode === 'learn' && (
          <section className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-3">Cách học vui</h2>
            <ol className="list-decimal pl-5 text-slate-700">
              <li>Nhìn bảng và nhấn "🔈 Nghe đáp" để nghe câu.</li>
              <li>Hãy nói to theo: ví dụ "2 nhân 3 bằng 6".</li>
              <li>Chơi trò quiz để luyện thật nhiều lần.</li>
            </ol>
            <div className="mt-4 text-sm text-slate-600">Mẹo: Thực hành 5 phút mỗi ngày sẽ giúp bé nhớ nhanh.</div>
          </section>
        )}

        {mode === 'quiz' && questions.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-md mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Câu hỏi {current + 1} / {questions.length}</h2>
              <div className="text-sm">Điểm: {score} ⭐</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 rounded-lg border p-4 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold">{questions[current].a} × {questions[current].b} = ?</div>

                <div className="mt-4 flex items-center gap-3">
                  <button onClick={() => speak(`${questions[current].a} nhân ${questions[current].b}`)} className="px-3 py-2 rounded-lg border">🔈 Nghe</button>
                  <button onClick={() => {
                    // show the answer hint for parents
                    speak(`Gợi ý: ${questions[current].product}`);
                  }} className="px-3 py-2 rounded-lg border">Gợi ý</button>
                </div>

                <div className="mt-4 w-full">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {makeChoices(questions[current]).map((c, idx) => (
                      <button key={idx} onClick={() => { checkAnswer(c); }} className="py-3 rounded-lg border text-lg font-medium">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <div className="text-sm text-slate-500">Hoặc nhập đáp án:</div>
                  <div className="flex gap-2 mt-2">
                    <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} className="px-3 py-2 border rounded-lg flex-1" />
                    <button onClick={() => checkAnswer(answer)} className="px-4 py-2 rounded-lg bg-amber-400 text-white">Kiểm tra</button>
                  </div>
                </div>

                {feedback === 'correct' && <div className="mt-3 text-green-600 font-semibold">Chính xác! 🌟</div>}
                {feedback === 'wrong' && <div className="mt-3 text-red-600 font-semibold">Chưa đúng — thử lần nữa!</div>}
              </div>

              <aside className="p-4 rounded-lg border bg-slate-50">
                <div className="mb-3">Tên bé: <strong>{childrenName || '---'}</strong></div>
                <div className="mb-2">Sao đã nhận: {Array.from({ length: starCount }).map((_, i) => <span key={i}>⭐</span>)}</div>
                <div className="text-sm text-slate-600">Mẹo: Khuyến khích bé bằng lời khen và sticker khi đạt 5 sao.</div>
                <div className="mt-4">
                  <button onClick={() => { startQuiz(); }} className="w-full py-2 rounded-lg bg-indigo-500 text-white">Làm lại</button>
                </div>
              </aside>
            </div>

          </section>
        )}

        {mode === 'result' && (
          <section className="bg-white rounded-2xl p-5 shadow-md mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Kết quả luyện tập</h2>
            <p className="text-lg mb-4">Bạn trả lời đúng <strong>{score}</strong> trên <strong>{questions.length}</strong> câu.</p>
            <p className="mb-4">Số sao: {Array.from({ length: starCount }).map((_, i) => <span key={i}>⭐</span>)}</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => { setMode('quiz'); startQuiz(); }} className="px-4 py-2 rounded-lg bg-green-500 text-white">Chơi lại</button>
              <button onClick={() => { setMode('learn'); }} className="px-4 py-2 rounded-lg bg-stone-200">Về Bảng học</button>
            </div>
          </section>
        )}

        <footer className="text-center text-sm text-slate-500 mt-6 mb-12">Thiết kế thân thiện cho trẻ em • Giọng đọc dùng SpeechSynthesis</footer>

      </div>
    </div>
  );
}
