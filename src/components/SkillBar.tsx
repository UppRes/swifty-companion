import React from 'react';
import { Skill42 } from '../types';

interface SkillBarProps {
  skill: Skill42;
  maxLevel?: number;
}

export const SkillBar: React.FC<SkillBarProps> = ({ skill, maxLevel = 21 }) => {
  const percentage = Math.min(100, Math.max(0, (skill.level / maxLevel) * 100));
  const formattedPercent = percentage.toFixed(1);

  return (
    <div 
      id={`skill-item-${skill.id}`}
      className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-xs"
    >
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-xs font-semibold text-slate-800 truncate" title={skill.name}>
          {skill.name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold text-blue-600">
            lvl {skill.level.toFixed(2)}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {formattedPercent}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative border border-slate-200">
        <div 
          className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out shadow-xs"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
