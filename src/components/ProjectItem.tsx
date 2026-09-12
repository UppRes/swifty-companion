import React from 'react';
import { ProjectUser42 } from '../types';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ProjectItemProps {
  projectUser: ProjectUser42;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ projectUser }) => {
  const isFinished = projectUser.status === 'finished';
  const isValidated = projectUser['validated?'] === true;
  const isFailed = isFinished && projectUser['validated?'] === false;
  const isInProgress = !isFinished;
  const mark = projectUser.final_mark;

  let statusBadgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
  let badgeIcon = <Clock className="w-3.5 h-3.5 text-slate-500" />;
  let badgeLabel = 'In Progress';

  if (isValidated) {
    statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    badgeIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    badgeLabel = 'Validated';
  } else if (isFailed) {
    statusBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    badgeIcon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
    badgeLabel = 'Failed';
  } else if (projectUser.status === 'searching_a_group') {
    badgeLabel = 'Group Search';
    badgeIcon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
    statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  // Format mark display
  const markColor = isValidated
    ? mark && mark >= 100 ? 'text-emerald-700 font-black' : 'text-emerald-600 font-extrabold'
    : isFailed
    ? 'text-rose-600 font-bold'
    : 'text-slate-400';

  return (
    <div 
      id={`project-item-${projectUser.id}`}
      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-xs ${
        isValidated 
          ? 'bg-white border-slate-200 hover:border-emerald-300' 
          : isFailed 
          ? 'bg-rose-50/20 border-rose-200/80 hover:border-rose-300' 
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-slate-900 truncate" title={projectUser.project.name}>
            {projectUser.project.name}
          </h4>
          {projectUser.occurrence > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
              Try {projectUser.occurrence + 1}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${statusBadgeColor}`}>
            {badgeIcon}
            <span>{badgeLabel}</span>
          </span>
          {projectUser.marked_at && (
            <span className="text-[11px] text-slate-400">
              {new Date(projectUser.marked_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Final Mark Score Box */}
      <div className="text-right shrink-0">
        {mark !== null ? (
          <div className="flex flex-col items-end">
            <span className={`text-base font-mono leading-none ${markColor}`}>
              {mark}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-400 italic">--</span>
        )}
      </div>
    </div>
  );
};
