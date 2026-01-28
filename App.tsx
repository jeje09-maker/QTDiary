
import React, { useState, useEffect, useCallback } from 'react';
import { DayData, UserStats, QTEntry, ScheduleItem } from './types';
import { INITIAL_QT, INITIAL_DIARY, STORAGE_KEY, STATS_KEY } from './constants';
import { fetchDailyQT, fetchBibleVersesWithInsight } from './services/geminiService';
import SpringBinder from './components/SpringBinder';
import GrowthTree from './components/GrowthTree';
import CalendarModal from './components/CalendarModal';
import StatsModal from './components/StatsModal';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [allData, setAllData] = useState<Record<string, DayData>>({});
  const [stats, setStats] = useState<UserStats>({ talents: 0, growthLevel: 0, streak: 0, totalCompleted: 0 });
  const [isBigFont, setIsBigFont] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBibleLoading, setIsBibleLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [showBibleInterleaf, setShowBibleInterleaf] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // 데이터 마이그레이션: 기존 문자열 스케줄을 배열로 변환
      Object.keys(parsedData).forEach(key => {
        if (typeof parsedData[key].diary.schedule === 'string') {
          parsedData[key].diary.schedule = parsedData[key].diary.schedule ? [{ id: Date.now().toString(), time: '00:00', task: parsedData[key].diary.schedule }] : [];
        }
      });
      setAllData(parsedData);
    }
    if (savedStats) setStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [allData, stats]);

  const currentDay: DayData = allData[currentDate] || {
    date: currentDate,
    qt: { ...INITIAL_QT },
    diary: { ...INITIAL_DIARY },
    completed: false
  };

  const updateField = useCallback((section: 'qt' | 'diary', field: string, value: any) => {
    setAllData(prev => {
      const prevDay = prev[currentDate] || {
        date: currentDate,
        qt: { ...INITIAL_QT },
        diary: { ...INITIAL_DIARY },
        completed: false
      };

      const updatedQT = { ...prevDay.qt };
      if (section === 'qt' && field === 'passage') {
        updatedQT.verses = '';
        updatedQT.analysis = '';
        updatedQT.meditation = '';
      }
      
      return {
        ...prev,
        [currentDate]: {
          ...prevDay,
          [section]: {
            ...(section === 'qt' ? updatedQT : prevDay.diary),
            [field]: value
          }
        }
      };
    });
  }, [currentDate]);

  const addScheduleItem = () => {
    const newItems = [...currentDay.diary.schedule, { id: Date.now().toString(), time: '09:00', task: '' }];
    updateField('diary', 'schedule', newItems);
  };

  const removeScheduleItem = (id: string) => {
    const newItems = currentDay.diary.schedule.filter(item => item.id !== id);
    updateField('diary', 'schedule', newItems);
  };

  const updateScheduleItem = (id: string, field: 'time' | 'task', value: string) => {
    const newItems = currentDay.diary.schedule.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    updateField('diary', 'schedule', newItems);
  };

  const updateScheduleForDate = (date: string, schedule: ScheduleItem[]) => {
    setAllData(prev => {
      const existing = prev[date] || {
        date,
        qt: { ...INITIAL_QT },
        diary: { ...INITIAL_DIARY },
        completed: false
      };
      return {
        ...prev,
        [date]: {
          ...existing,
          diary: { ...existing.diary, schedule }
        }
      };
    });
  };

  const toggleComplete = () => {
    const newCompleted = !currentDay.completed;
    setAllData(prev => ({
      ...prev,
      [currentDate]: {
        ...currentDay,
        completed: newCompleted
      }
    }));

    if (newCompleted) {
      setStats(prev => ({ ...prev, talents: prev.talents + 10, totalCompleted: prev.totalCompleted + 1 }));
    } else {
      setStats(prev => ({ ...prev, talents: Math.max(0, prev.talents - 10), totalCompleted: Math.max(0, prev.totalCompleted - 1) }));
    }
  };

  const loadAIQT = async () => {
    setIsLoading(true);
    const result = await fetchDailyQT(currentDate);
    setAllData(prev => ({
      ...prev,
      [currentDate]: {
        ...currentDay,
        qt: { ...currentDay.qt, ...result }
      }
    }));
    setIsLoading(false);
  };

  const handleReadBible = async () => {
    if (!currentDay.qt.passage) {
      alert("성경 장절을 먼저 입력해주세요 (예: 시편 23:1)");
      return;
    }

    if (currentDay.qt.verses) {
      setShowBibleInterleaf(true);
      return;
    }

    setShowBibleInterleaf(true);
    setIsBibleLoading(true);
    const result = await fetchBibleVersesWithInsight(currentDay.qt.passage);
    setAllData(prev => ({
      ...prev,
      [currentDate]: {
        ...currentDay,
        qt: {
          ...currentDay.qt,
          verses: result.verses || "",
          analysis: result.analysis || "",
          meditation: result.meditation || ""
        }
      }
    }));
    setIsBibleLoading(false);
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ allData, stats }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `qt-diary-backup-${currentDate}.json`);
    linkElement.click();
  };

  return (
    <div className={`min-h-screen bg-[#ece9df] p-4 md:p-8 flex flex-col items-center transition-all duration-300 ${isBigFont ? 'text-lg' : 'text-base'}`}>
      
      {isCalendarOpen && (
        <CalendarModal 
          currentDate={currentDate} 
          onSelectDate={setCurrentDate} 
          onUpdateSchedule={updateScheduleForDate}
          onClose={() => setIsCalendarOpen(false)} 
          allData={allData} 
        />
      )}
      {isStatsOpen && <StatsModal stats={stats} allData={allData} onClose={() => setIsStatsOpen(false)} />}

      <header className="w-full max-w-7xl flex flex-wrap items-center justify-between mb-8 gap-6 bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 shadow-xl">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-gray-800 serif tracking-tight">QT-Diary</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">개역개정 성경 묵상</p>
          </div>
          <div className="flex items-center bg-white rounded-2xl shadow-inner border border-orange-100 overflow-hidden text-sm">
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)}
              className="border-none px-4 py-2 text-gray-700 font-extrabold outline-none bg-transparent"
            />
            <button onClick={() => setIsCalendarOpen(true)} className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 transition border-l border-orange-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GrowthTree stats={stats} onClick={() => setIsStatsOpen(true)} />
          <button 
            onClick={toggleComplete}
            className={`px-8 py-3 rounded-2xl font-black shadow-lg transition-all transform active:scale-95 text-sm ${
              currentDay.completed ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            {currentDay.completed ? '✓ 묵상 마침' : '오늘의 묵상 마침'}
          </button>
          <div className="h-10 w-px bg-gray-200 mx-1"></div>
          <button onClick={() => setIsBigFont(!isBigFont)} className={`p-3 rounded-2xl font-bold transition shadow-sm border ${isBigFont ? 'bg-orange-100 border-orange-200 text-orange-800' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-700'}`}>
            <span className="text-lg leading-none">가</span>
          </button>
          <button onClick={exportData} className="bg-gray-100 text-gray-600 p-3 rounded-2xl font-bold hover:bg-gray-200 shadow-sm border border-gray-200 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          </button>
        </div>
      </header>

      <main className="relative w-full max-w-7xl h-[850px] bg-white rounded-[3rem] shadow-2xl flex flex-row overflow-hidden border-[12px] border-white/40">
        
        <SpringBinder />

        <section className="flex-1 h-full overflow-y-auto p-12 md:p-16 border-r border-gray-100 bg-white relative paper-texture">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h2 className="text-3xl font-black text-orange-900 serif tracking-tight">말씀 묵상</h2>
              <div className="w-16 h-1.5 bg-orange-200 rounded-full mt-2"></div>
            </div>
            <button 
              onClick={loadAIQT}
              disabled={isLoading}
              className="bg-orange-50 text-orange-800 px-5 py-2 rounded-xl hover:bg-orange-100 disabled:opacity-50 font-black transition border border-orange-100 text-[10px] uppercase tracking-widest shadow-sm"
            >
              {isLoading ? '추천 중...' : 'AI 본문 추천'}
            </button>
          </div>

          <div className="space-y-10 pb-20">
            <div>
              <label className="block text-[10px] font-black text-gray-300 mb-2 uppercase tracking-[0.3em]">오늘의 말씀 제목</label>
              <input 
                type="text"
                placeholder="은혜로운 제목을 적어주세요..."
                value={currentDay.qt.title}
                onChange={(e) => updateField('qt', 'title', e.target.value)}
                className="w-full text-3xl font-extrabold border-none bg-transparent placeholder-gray-100 focus:ring-0 serif text-gray-800 leading-snug"
              />
            </div>

            <div className="bg-orange-50/40 p-8 rounded-[2rem] border border-orange-100 shadow-inner flex justify-between items-center group">
              <div className="flex-1">
                <label className="text-[10px] font-black text-orange-300 uppercase tracking-widest mb-1 block">성경 장절 (개역개정)</label>
                <input 
                  type="text"
                  placeholder="예: 시편 23:1"
                  value={currentDay.qt.passage}
                  onChange={(e) => updateField('qt', 'passage', e.target.value)}
                  className="bg-transparent border-none focus:ring-0 font-extrabold text-orange-800 text-2xl w-full p-0 serif"
                />
              </div>
              <button 
                onClick={handleReadBible}
                disabled={isBibleLoading}
                className="ml-4 flex flex-col items-center justify-center p-3 bg-white border-2 border-orange-600 rounded-2xl shadow-xl transition-all transform hover:scale-110 active:scale-95 group/btn"
              >
                <div className="relative mb-1">
                  <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 2H5c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm-1 18H6V4h12v16zm-4-14h-4v2h4V6zm0 4h-4v2h4v-2zm0 4h-4v2h4v-2z"/>
                  </svg>
                  {isBibleLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                      <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">본문읽기</span>
              </button>
            </div>

            {currentDay.qt.analysis && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-gray-50/60 p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                  <label className="block text-[10px] font-black text-blue-300 mb-4 uppercase tracking-[0.3em]">AI 말씀 해설</label>
                  <div className="serif leading-[1.8] text-gray-700 whitespace-pre-wrap text-lg">
                    {currentDay.qt.analysis}
                  </div>
                </div>
              </div>
            )}

            {currentDay.qt.meditation && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-blue-50/20 p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
                  <label className="block text-[10px] font-black text-blue-400 mb-4 uppercase tracking-[0.3em]">AI 묵상 가이드</label>
                  <div className="serif italic leading-[1.8] text-blue-900 whitespace-pre-wrap text-lg">
                    {currentDay.qt.meditation}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-emerald-50/30 p-10 rounded-[2.5rem] border-2 border-emerald-100/50 relative group transition-all hover:bg-emerald-50/40">
              <label className="block text-[10px] font-black text-emerald-400 mb-6 uppercase tracking-[0.3em]">나의 고백 (은혜 받은 내용)</label>
              <textarea 
                placeholder="주님께서 오늘 나에게 깨닫게 하신 은혜를 진솔하게 기록하세요..."
                rows={10}
                value={currentDay.qt.grace}
                onChange={(e) => updateField('qt', 'grace', e.target.value)}
                className={`w-full bg-transparent border-none focus:ring-0 resize-none leading-[2] serif transition-all text-gray-800 ${isBigFont ? 'text-2xl' : 'text-xl'}`}
              />
              <div className="absolute bottom-6 right-8 text-3xl opacity-10 group-hover:opacity-100 transition duration-500">✍️</div>
            </div>

            <div className="pb-10">
              <label className="block text-[10px] font-black text-gray-300 mb-4 uppercase tracking-[0.3em]">오늘의 기도</label>
              <textarea 
                placeholder="묵상의 내용을 담은 간절한 기도..."
                rows={5}
                value={currentDay.qt.prayer}
                onChange={(e) => updateField('qt', 'prayer', e.target.value)}
                className="w-full bg-transparent border-b border-gray-100 focus:border-orange-200 transition focus:ring-0 resize-none py-2 leading-relaxed serif italic text-gray-500 text-lg"
              />
            </div>
          </div>
        </section>

        <section className="flex-1 h-full overflow-y-auto p-12 md:p-16 bg-white relative paper-texture">
          {showBibleInterleaf && (
            <div className="absolute inset-y-8 inset-x-8 z-30 bg-[#fdfcf7] rounded-[2rem] shadow-[-15px_0px_40px_rgba(0,0,0,0.15)] border-l-[10px] border-orange-100 paper-texture flex flex-col overflow-hidden animate-in slide-in-from-right-full duration-700 ease-out transform translate-x-2">
              <div className="bg-orange-50 px-8 py-6 flex justify-between items-center border-b border-orange-100">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📖</span>
                  <h3 className="text-xl font-black text-orange-900 serif">{currentDay.qt.passage || "성경 본문"}</h3>
                </div>
                <button onClick={() => setShowBibleInterleaf(false)} className="p-2 hover:bg-orange-200 rounded-full text-orange-800 transition">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 p-12 overflow-y-auto bg-white/40">
                {isBibleLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-24">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    <p className="text-orange-600 font-bold serif text-lg animate-pulse">개역개정 본문을 준비하고 있습니다...</p>
                  </div>
                ) : (
                  <div className={`whitespace-pre-wrap serif leading-[2.4] text-gray-800 ${isBigFont ? 'text-2xl' : 'text-xl'}`}>
                    {currentDay.qt.verses || "성경 본문을 불러오는 중입니다. 잠시만 기다려주세요."}
                  </div>
                )}
              </div>
              <div className="p-5 bg-orange-50/60 text-center border-t border-orange-100">
                <p className="text-[11px] text-orange-400 font-bold uppercase tracking-widest italic">개역개정판 성경전서</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-800 serif tracking-tight">데일리 일기</h2>
              <div className="w-16 h-1.5 bg-blue-100 rounded-full mt-2"></div>
            </div>
            <select 
              value={currentDay.diary.weather}
              onChange={(e) => updateField('diary', 'weather', e.target.value)}
              className="bg-gray-50 border border-gray-100 rounded-full px-6 py-2.5 outline-none font-black shadow-sm text-sm"
            >
              <option>☀️ 맑음</option><option>☁️ 흐림</option><option>🌧️ 비</option><option>❄️ 눈</option>
            </select>
          </div>

          <div className="space-y-12 pb-20">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center mb-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">🗓️ 오늘의 주요 일정 (시간별)</label>
                <button 
                  onClick={addScheduleItem}
                  className="bg-orange-600 text-white text-[10px] px-3 py-1 rounded-full font-black hover:bg-orange-700 transition shadow-md"
                >
                  + 일정 추가
                </button>
              </div>
              
              <div className="space-y-4">
                {currentDay.diary.schedule.length === 0 ? (
                  <p className="text-gray-300 text-sm italic py-4 text-center">오늘의 일정을 추가해보세요.</p>
                ) : (
                  currentDay.diary.schedule.sort((a,b) => a.time.localeCompare(b.time)).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 group animate-in slide-in-from-left-2">
                      <input 
                        type="time"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(item.id, 'time', e.target.value)}
                        className="bg-orange-50/50 border-none rounded-xl px-3 py-2 text-orange-800 font-bold text-sm focus:ring-1 focus:ring-orange-200 outline-none"
                      />
                      <input 
                        type="text"
                        placeholder="일정 내용..."
                        value={item.task}
                        onChange={(e) => updateScheduleItem(item.id, 'task', e.target.value)}
                        className="flex-1 bg-transparent border-b border-gray-50 focus:border-orange-100 focus:ring-0 py-2 text-gray-700 font-bold text-sm outline-none"
                      />
                      <button 
                        onClick={() => removeScheduleItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] font-black text-gray-400 mb-6 uppercase tracking-widest">오늘의 성찰</label>
              <textarea 
                placeholder="주님과 함께 동행한 오늘 하루를 고백합니다..."
                rows={18}
                value={currentDay.diary.diary}
                onChange={(e) => updateField('diary', 'diary', e.target.value)}
                className={`w-full bg-transparent border-none focus:ring-0 resize-none leading-[2.4] transition-all font-light ${isBigFont ? 'text-2xl' : 'text-xl'}`}
              />
              <div className="absolute top-8 left-0 w-full h-full pointer-events-none opacity-[0.06]">
                {Array.from({length: 40}).map((_, i) => (
                   <div key={i} className="border-b border-gray-800 h-9"></div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/20 p-8 rounded-[2.5rem] border border-emerald-100/50 shadow-inner">
              <label className="block text-[10px] font-black text-emerald-400 mb-4 uppercase tracking-[0.3em]">🙏 감사 기도 제목</label>
              <textarea 
                placeholder="일상의 작은 감사를 고백하며 주님께 영광을..."
                rows={4}
                value={currentDay.diary.thanksgiving}
                onChange={(e) => updateField('diary', 'thanksgiving', e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 resize-none italic text-emerald-800 font-medium text-lg leading-relaxed"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 text-gray-400 text-xs text-center pb-12 uppercase tracking-[0.4em]">
        <p className="font-black">© 2024 QT-Diary • 성인을 위한 개역개정 묵상 일지</p>
      </footer>
    </div>
  );
};

export default App;
