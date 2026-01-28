
import React from 'react';
import { UserStats, DayData } from '../types';
import { GROWTH_LEVELS } from '../constants';

interface StatsModalProps {
  stats: UserStats;
  allData: Record<string, DayData>;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ stats, allData, onClose }) => {
  // Explicitly type the iterator variable 'd' as 'DayData' to resolve the 'unknown' type error.
  const completedDays = Object.values(allData).filter((d: DayData) => d.completed).length;
  const totalDays = Object.keys(allData).length;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-orange-50 paper-texture">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="text-6xl mb-4">🌳</div>
          <h2 className="text-3xl font-extrabold serif">신앙 성장 리포트</h2>
          <p className="text-white/80 mt-2 italic font-light">"내가 선한 싸움을 싸우고 나의 달려갈 길을 마치고..."</p>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-6 rounded-2xl text-center border border-orange-100">
              <p className="text-xs font-bold text-orange-400 mb-1">총 묵상 일수</p>
              <p className="text-3xl font-black text-orange-700 serif">{stats.totalCompleted}회</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
              <p className="text-xs font-bold text-emerald-400 mb-1">획득 달란트</p>
              <p className="text-3xl font-black text-emerald-700 serif">{stats.talents}P</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">성장 로드맵</h3>
            <div className="space-y-4">
              {GROWTH_LEVELS.map((level, idx) => {
                const isReached = stats.totalCompleted >= level.threshold;
                return (
                  <div key={idx} className={`flex items-center space-x-4 p-3 rounded-xl transition ${isReached ? 'bg-white shadow-sm' : 'opacity-40 grayscale'}`}>
                    <div className="text-2xl">{level.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">{level.name}</span>
                        <span className="text-xs text-gray-400">{level.threshold}회 달성 시</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 mt-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isReached ? 'bg-green-500' : 'bg-gray-300'}`}
                          style={{ width: isReached ? '100%' : '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-center">
          <button 
            onClick={onClose} 
            className="px-12 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition shadow-lg"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
