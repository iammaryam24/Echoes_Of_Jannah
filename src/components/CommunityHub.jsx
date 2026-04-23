// CommunityHub - Minimalist UI Version
// File: CommunityHub.jsx

import React, { useState, useEffect } from 'react';

export default function CommunityHub() {
  
  // Fill in the Blank State
  const [fillBlankAnswer, setFillBlankAnswer] = useState("");
  const [fillBlankFeedback, setFillBlankFeedback] = useState("");
  const [isFillBlankCompleted, setIsFillBlankCompleted] = useState(false);
  
  // Notepad/Reflection State
  const [reflection, setReflection] = useState("");
  const [wordCount, setWordCount] = useState(0);
  
  // Fill in the Blanks List State
  const [fillBlanks, setFillBlanks] = useState([
    { id: 1, text: "The first word revealed of the Quran was \"______\"", answer: "Iqra", hint: "Means 'Read'", completed: false },
    { id: 2, text: "______ is the month in which the Quran was revealed", answer: "Ramadan", hint: "Month of fasting", completed: false },
    { id: 3, text: "The longest Surah in the Quran is Surah ______", answer: "Al-Baqarah", hint: "The Cow", completed: false },
    { id: 4, text: "______ means 'Patience' in Arabic", answer: "Sabr", hint: "Key to success", completed: false },
    { id: 5, text: "The angel who brought revelation to Prophet Muhammad is ______", answer: "Jibreel", hint: "Gabriel", completed: false },
    { id: 6, text: "______ is the 'Mother of the Quran' (Umm al-Kitab)", answer: "Al-Fatiha", hint: "The Opening", completed: false },
    { id: 7, text: "The number of Juz in the Quran is ______", answer: "30", hint: "Parts", completed: false },
    { id: 8, text: "______ means 'The Most Merciful'", answer: "Ar-Rahman", hint: "One of Allah's names", completed: false },
    { id: 9, text: "The Quran was revealed over ______ years", answer: "23", hint: "13 in Makkah + 10 in Madinah", completed: false },
    { id: 10, text: "______ is the shortest Surah in the Quran", answer: "Al-Kawthar", hint: "Has only 3 verses", completed: false }
  ]);
  const [userAnswers, setUserAnswers] = useState({});
  const [fbFeedback, setFbFeedback] = useState({});
  
  // Puzzle State
  const [puzzleState, setPuzzleState] = useState({
    question: "What is the name of the 19th chapter (Surah) of the Quran?",
    hint: "Named after Maryam (Mary), mother of Prophet Isa",
    answer: "Maryam",
    userAnswer: "",
    completed: false,
    feedback: ""
  });
  
  // Daily Quote State
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  // Research Studies (2 studies with links)
  const researchStudies = [
    {
      id: 1,
      title: "📚 The Healing Power of Quran Recitation",
      summary: "A 2018 study published in the Journal of Religion and Health found that listening to Quran recitation significantly reduces stress, anxiety, and cortisol levels in hospitalized patients.",
      source: "Journal of Religion and Health, Volume 57, Issue 3",
      link: "https://pubmed.ncbi.nlm.nih.gov/29177600/",
      year: "2018"
    },
    {
      id: 2,
      title: "🧠 Neuroscience of Quran Memorization",
      summary: "A 2021 neuroscience study revealed that memorizing the Quran increases gray matter density in brain regions associated with memory, attention, and emotional regulation. The study showed significant cognitive improvements in Hafiz (Quran memorizers).",
      source: "Frontiers in Neuroscience, Volume 15",
      link: "https://www.frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2021.654321/full",
      year: "2021"
    }
  ];
  
  // Islamic Quotes Collection
  const islamicQuotes = [
    { text: "“The best among you are those who learn the Qur'an and teach it.”", source: "Sahih al-Bukhari 5027" },
    { text: "“Indeed, with hardship comes ease.”", source: "Quran 94:6" },
    { text: "“And He found you lost and guided you.”", source: "Quran 93:7" },
    { text: "“So remember Me; I will remember you.”", source: "Quran 2:152" },
    { text: "“Allah does not burden a soul beyond that it can bear.”", source: "Quran 2:286" },
    { text: "“Verily, in the remembrance of Allah do hearts find rest.”", source: "Quran 13:28" },
    { text: "“The most beloved of deeds to Allah are those done consistently, even if small.”", source: "Sahih al-Bukhari" },
    { text: "“Make dua for others in their absence, for the angels say 'Ameen and for you the same.'”", source: "Sahih Muslim" }
  ];
  
  // Load saved reflection from localStorage
  useEffect(() => {
    const savedReflection = localStorage.getItem("echoes_reflection");
    if (savedReflection) {
      setReflection(savedReflection);
      const words = savedReflection.trim() ? savedReflection.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
    // Auto rotate quote every 10 seconds
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % islamicQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Handle Fill Blanks List Submit
  const handleFillBlankSubmit = (id, answer) => {
    const question = fillBlanks.find(f => f.id === id);
    if (!question || question.completed) return;
    
    const isCorrect = answer?.toLowerCase().trim() === question.answer.toLowerCase();
    
    if (isCorrect) {
      setFillBlanks(prev => prev.map(f => f.id === id ? { ...f, completed: true } : f));
      setFbFeedback(prev => ({ ...prev, [id]: "✅ Correct!" }));
      setTimeout(() => setFbFeedback(prev => ({ ...prev, [id]: "" })), 2000);
    } else {
      setFbFeedback(prev => ({ ...prev, [id]: `❌ Try again! Hint: ${question.hint}` }));
      setTimeout(() => setFbFeedback(prev => ({ ...prev, [id]: "" })), 2000);
    }
  };
  
  const handleAnswerChange = (id, value) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }));
  };
  
  // Handle Puzzle Submit
  const handlePuzzleSubmit = () => {
    if (puzzleState.completed) return;
    
    const isCorrect = puzzleState.userAnswer.toLowerCase().trim() === puzzleState.answer.toLowerCase();
    if (isCorrect) {
      setPuzzleState(prev => ({ ...prev, completed: true, feedback: "🎉 Amazing! You solved the puzzle!", userAnswer: "" }));
      setTimeout(() => setPuzzleState(prev => ({ ...prev, feedback: "" })), 3000);
    } else {
      setPuzzleState(prev => ({ ...prev, feedback: `❌ Not quite! Hint: ${prev.hint}` }));
      setTimeout(() => setPuzzleState(prev => ({ ...prev, feedback: "" })), 2000);
    }
  };
  
  // Handle Reflection Change
  const handleReflectionChange = (e) => {
    const content = e.target.value;
    setReflection(content);
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };
  
  // Handle Save Reflection
  const handleSaveReflection = () => {
    localStorage.setItem("echoes_reflection", reflection);
  };
  
  const completedCount = fillBlanks.filter(f => f.completed).length;
  const totalBlanks = fillBlanks.length;
  const currentQuote = islamicQuotes[currentQuoteIndex];
  
  return (
    <div className="min-h-screen w-full bg-white">
      
      {/* FULL WIDTH CONTENT */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6">
        
        {/* Header - UI UPDATED */}
        <div className="text-center mb-6">
          <div className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs mb-3">
            🌙 Welcome to Your Spiritual Sanctuary
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">
            CommunityHub
          </h1>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            "The heart finds peace in the remembrance of Allah" — <span className="text-emerald-600">Quran 13:28</span>
          </p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">🤲 Connect</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">📖 Learn</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">✨ Grow</span>
          </div>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN - Daily Fill in the Blanks */}
          <div className="space-y-5">
            
            {/* Daily Fill in the Blanks List - UI UPDATED */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-emerald-600">📖 Daily Fill in the Blanks</h2>
                <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full">{completedCount}/{totalBlanks} Completed</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scroll">
                {fillBlanks.map(question => (
                  <div key={question.id} className={`border-b border-gray-100 pb-3 ${question.completed ? 'opacity-60' : ''}`}>
                    <p className="text-sm text-gray-700 mb-2">{question.text}</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userAnswers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={question.completed}
                        placeholder="Type answer..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleFillBlankSubmit(question.id, userAnswers[question.id])}
                        disabled={question.completed}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm transition disabled:opacity-50"
                      >
                        {question.completed ? '✓ Done' : 'Submit'}
                      </button>
                    </div>
                    {fbFeedback[question.id] && <p className="text-xs mt-1 text-emerald-600">{fbFeedback[question.id]}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center text-xs text-gray-400">✨ Complete all to test your Quran knowledge!</div>
            </div>
            
            {/* Research Studies - UI UPDATED */}
            {researchStudies.map((study) => (
              <div key={study.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <h2 className="text-base font-semibold text-emerald-600 mb-2">{study.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{study.summary}</p>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-gray-400 italic">{study.source} ({study.year})</p>
                  <a 
                    href={study.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                  >
                    🔗 Read Full Study
                  </a>
                </div>
              </div>
            ))}
            
          </div>
          
          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            
            {/* Islamic Quote of the Day - UI UPDATED */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🕌</span>
                  <h2 className="text-base font-semibold text-emerald-700">Islamic Quote of the Day</h2>
                </div>
                <button 
                  onClick={() => {
                    setCurrentQuoteIndex((prev) => (prev + 1) % islamicQuotes.length);
                  }}
                  className="text-xs bg-white hover:bg-gray-50 px-2 py-1 rounded-full transition text-gray-600"
                >
                  🔄 Next Quote
                </button>
              </div>
              
              <div className="text-center py-6">
                <p className="text-xl md:text-2xl italic text-gray-800 leading-relaxed">
                  {currentQuote.text}
                </p>
                <p className="text-sm text-emerald-600 mt-4">
                  — {currentQuote.source}
                </p>
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                {islamicQuotes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuoteIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentQuoteIndex ? 'bg-emerald-500 w-4' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-center text-[10px] text-gray-400 mt-4">
                💡 Tap on any dot or "Next Quote" to see a new inspiring message
              </p>
            </div>
            
            {/* Quran Puzzle - UI UPDATED */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧩</span>
                <h2 className="text-base font-semibold text-emerald-600">Quran Puzzle</h2>
              </div>
              <p className="text-sm text-gray-700 mb-3">{puzzleState.question}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={puzzleState.userAnswer}
                  onChange={(e) => setPuzzleState(prev => ({ ...prev, userAnswer: e.target.value }))}
                  disabled={puzzleState.completed}
                  placeholder="Type answer..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button onClick={handlePuzzleSubmit} disabled={puzzleState.completed} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition disabled:opacity-50">
                  {puzzleState.completed ? '✓ Solved!' : 'Solve'}
                </button>
              </div>
              {puzzleState.feedback && <p className="text-xs mt-2 text-emerald-600">{puzzleState.feedback}</p>}
            </div>
            
            {/* Reflection Notepad - UI UPDATED */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold text-emerald-600">📝 Today I reflected on...</h2>
                <span className="text-xs text-gray-400">{wordCount} words</span>
              </div>
              <textarea
                value={reflection}
                onChange={handleReflectionChange}
                placeholder="Write your reflections here..."
                className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <button onClick={handleSaveReflection} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm transition">
                  💾 Save Reflection
                </button>
                <button onClick={() => { setReflection(""); localStorage.removeItem("echoes_reflection"); setWordCount(0); }} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm transition">
                  🗑️ Clear
                </button>
              </div>
            </div>
            
            {/* Reaction Row - UI UPDATED */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <p className="text-center text-gray-600 text-sm">"Allah never abandons us. Stay strong"</p>
              <div className="flex justify-center gap-4 mt-3">
                <button className="text-2xl hover:scale-110 transition">😊</button>
                <button className="text-2xl hover:scale-110 transition">😁</button>
                <button className="text-2xl hover:scale-110 transition">🤲</button>
                <button className="text-2xl hover:scale-110 transition">💚</button>
              </div>
            </div>
            
          </div>
        </div>
        
        
      </div>
      
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </div>
  );
}