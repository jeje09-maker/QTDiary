
import React from 'react';
import { GROWTH_LEVELS } from '../constants';
import { UserStats } from '../types';

interface GrowthTreeProps {
  stats: UserStats;
  onClick: () => void;
}

const GrowthTree: React.FC<GrowthTreeProps> = ({ stats, onClick }) => {
  const currentLevel = GROWTH_LEVELS.find((l, i) => {
    const next = GROWTH_LEVELS[i + 1];
    return stats.totalCompleted >= l.threshold && (!next || stats.totalCompleted < next.threshold);
  }) || GROWTH_LEVELS[0];

  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-2 rounded-2xl bg-white/50 hover:bg-white transition-all shadow-sm border border-orange-100 hover:scale-105 active:scale-95"
      title="신앙 성장 통계 보기"
    >
      <div className="text-4xl filter drop-shadow-sm mb-1">
        {currentLevel.icon}
      </div>
      <span className="text-[10px] font-bold text-orange-700 uppercase tracking-tighter">성장도: {currentLevel.name}</span>
      <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        {stats.totalCompleted}
      </div>
    </button>
  );
};

export default GrowthTree;
