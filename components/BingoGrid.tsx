import React from 'react';
import { Star, Sparkles } from 'lucide-react';

interface BingoGridProps {
  tasks: string[];
  stampedIndexes?: number[];
}

const BingoGrid: React.FC<BingoGridProps> = ({ tasks, stampedIndexes = [] }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-white p-5 rounded-[2.5rem] shadow-xl border-4 border-brand-100">
      <div className="text-center mb-6">
        <h4 className="text-brand-600 font-bold text-xl flex items-center justify-center gap-2">
          <Sparkles className="text-accent-500 animate-pulse" size={20} />
          <span>BINGO MISSION</span>
          <Sparkles className="text-accent-500 animate-pulse" size={20} />
        </h4>
        <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-widest">ミッションをクリアしてスタンプを集めよう！</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {tasks.map((task, index) => {
          const isStamped = stampedIndexes.includes(index);
          return (
            <div 
              key={index}
              className={`
                aspect-square rounded-2xl flex items-center justify-center p-2 text-center transition-all duration-500 transform
                ${isStamped 
                  ? "bg-brand-500 text-white shadow-lg scale-100 rotate-0 stamped-cell ring-4 ring-brand-100" 
                  : "bg-brand-50 border-2 border-brand-100 text-brand-800 hover:bg-brand-100 hover:scale-105"
                }
              `}
            >
              <span className={`text-[10px] sm:text-xs font-bold leading-tight select-none`}>
                {task}
              </span>
              {isStamped && (
                <div className="absolute -top-1 -right-1 bg-accent-500 rounded-full p-1 shadow-sm">
                  <Star size={8} className="fill-white text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BingoGrid;
