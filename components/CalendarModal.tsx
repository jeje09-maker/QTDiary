
import React, { useState } from 'react';
import { DayData, ScheduleItem } from '../types';

interface CalendarModalProps {
  currentDate: string;
  onSelectDate: (date: string) => void;
  onUpdateSchedule: (date: string, schedule: ScheduleItem[]) => void;
  onClose: () => void;
  allData: Record<string, DayData>;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ 
  currentDate, 
  onSelectDate, 
  onUpdateSchedule,
  onClose, 
  allData 
}) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  const [selectedInModal, setSelectedInModal] = useState(currentDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const formatDate = (d: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const selectedData = allData[selectedInModal] || { diary: { schedule: [] as ScheduleItem[] } };
  const schedules = selectedData.diary?.schedule || [];

  const handleAddItem = () => {
    const newItem: ScheduleItem = { id: Date.now().toString(), time: '09:00', task: '' };
    onUpdateSchedule(selectedInModal, [...schedules, newItem]);
  };

  const handleUpdateItem = (id: string, field: 'time' | 'task', value: string) => {
    const updated = schedules.map(s => s.id === id ? { ...s, [field]: value } : s);
    onUpdateSchedule(selectedInModal, updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = schedules.filter(s => s.id !== id);
    onUpdateSchedule(selectedInModal, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="bg-[#fdfcf7] w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-orange-100 paper-texture flex flex-col md:flex-row h-[700px]">
        
        {/* Left: Calendar Grid */}
        <div className="flex-1 p-8 flex flex-col border-r border-orange-50">
          <div className="flex justify-between items-center mb-8">
            <button onClick={prevMonth} className="p-3 hover:bg-orange-100 rounded-2xl transition text-orange-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="text-2xl font-black serif text-orange-900">{year}년 {month + 1}월 일정표</h2>
            <button onClick={nextMonth} className="p-3 hover:bg-orange-100 rounded-2xl transition text-orange-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-[10px] font-black text-orange-300 uppercase tracking-widest">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2 flex-1">
            {emptyDays.map(i => <div key={`empty-${i}`} className="h-full bg-orange-50/20 rounded-xl" />)}
            {days.map(d => {
              const dateStr = formatDate(d);
              const data = allData[dateStr];
              const isSelected = dateStr === selectedInModal;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const hasSchedule = data?.diary?.schedule && data.diary.schedule.length > 0;
              const isCompleted = data?.completed;

              return (
                <button
                  key={d}
                  onClick={() => setSelectedInModal(dateStr)}
                  className={`
                    relative h-full min-h-[70px] flex flex-col items-start p-2 rounded-xl transition-all border
                    ${isSelected ? 'bg-orange-600 border-orange-600 text-white shadow-lg z-10 scale-105' : 'bg-white border-orange-50 hover:border-orange-200 text-gray-700'}
                    ${isToday && !isSelected ? 'ring-2 ring-orange-400 ring-inset' : ''}
                  `}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xs font-black">{d}</span>
                    {isCompleted && <span className={isSelected ? 'text-white' : 'text-emerald-500'}>✓</span>}
                  </div>
                  {hasSchedule && (
                    <div className={`mt-1 text-[8px] text-left line-clamp-2 leading-tight opacity-80 ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                      {data.diary.schedule[0].task} {data.diary.schedule.length > 1 ? `외 ${data.diary.schedule.length-1}건` : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Schedule Details & Quick Edit */}
        <div className="w-full md:w-96 bg-orange-50/30 p-8 flex flex-col">
          <div className="mb-6">
            <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-1">선택된 날짜</label>
            <div className="text-2xl font-black text-orange-900 serif">{selectedInModal}</div>
          </div>

          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">🗓️ 시간별 일정 관리</label>
                <button 
                  onClick={handleAddItem}
                  className="bg-orange-100 text-orange-600 p-1 px-2 rounded-lg text-[9px] font-black hover:bg-orange-200 transition"
                >
                  추가
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {schedules.length === 0 ? (
                  <p className="text-gray-300 text-[11px] italic py-8 text-center">일정이 없습니다.</p>
                ) : (
                  schedules.sort((a,b) => a.time.localeCompare(b.time)).map((item) => (
                    <div key={item.id} className="flex items-start space-x-2 group">
                      <div className="flex flex-col space-y-1">
                        <input 
                          type="time"
                          value={item.time}
                          onChange={(e) => handleUpdateItem(item.id, 'time', e.target.value)}
                          className="text-[10px] font-bold text-orange-700 bg-orange-50 rounded-lg p-1 outline-none border-none focus:ring-1 focus:ring-orange-200"
                        />
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-[9px] text-gray-300 hover:text-red-400 font-bold"
                        >
                          삭제
                        </button>
                      </div>
                      <textarea 
                        value={item.task}
                        onChange={(e) => handleUpdateItem(item.id, 'task', e.target.value)}
                        placeholder="할 일..."
                        className="flex-1 bg-gray-50/50 border-none rounded-xl p-2 text-xs font-bold text-gray-700 focus:ring-1 focus:ring-orange-100 resize-none h-14"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {allData[selectedInModal]?.qt?.title && (
              <div className="bg-white/50 p-6 rounded-3xl border border-orange-100/50 shrink-0">
                <label className="text-[10px] font-black text-orange-300 uppercase tracking-widest block mb-2">말씀 제목</label>
                <div className="text-xs font-bold text-orange-800 line-clamp-2 serif">
                  {allData[selectedInModal].qt.title}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3 shrink-0">
            <button 
              onClick={() => {
                onSelectDate(selectedInModal);
                onClose();
              }}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-orange-700 transition transform active:scale-95"
            >
              이 날짜 다이어리 펴기
            </button>
            <button onClick={onClose} className="w-full py-4 bg-white text-gray-400 rounded-2xl font-black text-sm border border-gray-100 hover:text-gray-600 transition">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
