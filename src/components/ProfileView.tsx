import React, { useState } from 'react';
import { User42 } from '../types';
import { SkillBar } from './SkillBar';
import { ProjectItem } from './ProjectItem';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Coins,
  Award,
  Layers,
  Sparkles,
  Search,
  Filter,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface ProfileViewProps {
  user: User42;
  onNavigateBack: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onNavigateBack }) => {
  // Select active cursus (default to 42cursus if available, or first in list)
  const [selectedCursusId, setSelectedCursusId] = useState<number>(() => {
    const mainCursus = user.cursus_users?.find(
      (c) => c.cursus.slug === '42cursus' || c.cursus.name.toLowerCase().includes('42')
    );
    return mainCursus ? mainCursus.cursus_id : user.cursus_users?.[0]?.cursus_id || 21;
  });

  // Active view tab: 'skills' | 'projects' | 'achievements'
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'achievements'>('skills');

  // Project filtering state
  const [projectFilter, setProjectFilter] = useState<'all' | 'validated' | 'failed' | 'in_progress'>('all');
  const [projectSearch, setProjectSearch] = useState('');

  // Skill sorting & filtering
  const [skillSearch, setSkillSearch] = useState('');
  const [skillSort, setSkillSort] = useState<'level_desc' | 'level_asc' | 'alpha'>('level_desc');

  // Current active cursus data
  const currentCursusUser = user.cursus_users?.find((c) => c.cursus_id === selectedCursusId) || user.cursus_users?.[0];
  const currentLevel = currentCursusUser?.level || 0;
  const levelInt = Math.floor(currentLevel);
  const levelPercent = Math.round((currentLevel - levelInt) * 100);

  // Avatar source resolution
  const avatarUrl = user.image?.versions?.medium || user.image?.link || user.image?.versions?.large;

  // Filter projects according to selected cursus
  const filteredProjects = (user.projects_users || []).filter((p) => {
    // If cursus_ids is present, check match
    if (p.cursus_ids && p.cursus_ids.length > 0 && selectedCursusId) {
      if (!p.cursus_ids.includes(selectedCursusId)) return false;
    }
    // Filter by status tab
    if (projectFilter === 'validated' && p['validated?'] !== true) return false;
    if (projectFilter === 'failed' && !(p.status === 'finished' && p['validated?'] === false)) return false;
    if (projectFilter === 'in_progress' && p.status === 'finished') return false;

    // Search query
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase().trim();
      return p.project.name.toLowerCase().includes(q) || p.project.slug.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter and sort skills
  const skillsList = (currentCursusUser?.skills || [])
    .filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase().trim()))
    .sort((a, b) => {
      if (skillSort === 'level_desc') return b.level - a.level;
      if (skillSort === 'level_asc') return a.level - b.level;
      return a.name.localeCompare(b.name);
    });

  // Project statistics
  const totalProjects = user.projects_users?.length || 0;
  const validatedProjects = user.projects_users?.filter((p) => p['validated?'] === true).length || 0;
  const failedProjects = user.projects_users?.filter((p) => p.status === 'finished' && p['validated?'] === false).length || 0;
  const inProgressProjects = user.projects_users?.filter((p) => p.status !== 'finished').length || 0;

  return (
    <div id="student-profile-view" className="flex flex-col flex-1 pb-10 w-full max-w-4xl mx-auto px-4 md:px-6">
      {/* Back Navigation Bar */}
      <div className="py-3 flex items-center justify-between border-b border-slate-200 mb-4">
        <button
          id="profile-back-btn"
          type="button"
          onClick={onNavigateBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>Back to Search</span>
        </button>

        <div className="flex items-center gap-2">
          {user.isDemo && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-medium">
              Sample 42 Profile
            </span>
          )}
          <span className="text-xs font-mono text-slate-500">
            ID: #{user.id}
          </span>
        </div>
      </div>

      {/* Main Profile Header Card (Displays Profile Pic + Mandatory User Details) */}
      <div 
        id="profile-header-card"
        className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm mb-6 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Profile Picture with Location Indicator */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.displayname || user.login}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-blue-600 text-3xl font-bold font-mono">
                  {user.login.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Online/Cluster Seat Status Dot */}
            <div 
              className={`absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border shadow-xs ${
                user.location 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={user.location ? `Logged at ${user.location}` : 'Unavailable / Logged out'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${user.location ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{user.location || 'Offline'}</span>
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {user.displayname || `${user.first_name} ${user.last_name}`}
              </h2>
              {user['staff?'] && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase tracking-wider">
                  42 Staff
                </span>
              )}
              {currentCursusUser?.grade && (
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                  {currentCursusUser.grade}
                </span>
              )}
            </div>

            <div className="text-sm font-mono text-blue-600 font-semibold mb-3">
              @{user.login}
            </div>

            {/* Mandatory User Details Grid (Email, Mobile, Location, Wallet, Evaluations, etc.) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-600">
              {/* 1. Email */}
              <a
                id="user-detail-email"
                href={`mailto:${user.email}`}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-blue-300 hover:bg-slate-50 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{user.email || 'No email provided'}</span>
              </a>

              {/* 2. Mobile / Phone */}
              <div 
                id="user-detail-phone"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{user.phone || 'Confidential / Unset'}</span>
              </div>

              {/* 3. Location / Cluster */}
              <div 
                id="user-detail-location"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate font-mono">
                  {user.location ? `Host: ${user.location}` : 'Not at cluster desk'}
                </span>
              </div>

              {/* 4. Wallet (Altcoins) */}
              <div 
                id="user-detail-wallet"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Wallet: <strong className="text-slate-900 font-mono">{user.wallet} ₳</strong></span>
              </div>

              {/* 5. Evaluations / Correction Points */}
              <div 
                id="user-detail-correction-points"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Evaluation pts: <strong className="text-slate-900 font-mono">{user.correction_point}</strong></span>
              </div>

              {/* 6. Campus & Pool */}
              <div 
                id="user-detail-campus"
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 border border-slate-200/80"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {user.campus?.[0]?.name || '42 Network'} 
                  {user.pool_year ? ` • Piscine ${user.pool_month} ${user.pool_year}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cursus Switcher Tabs (e.g. 42cursus vs C Piscine) */}
        {user.cursus_users && user.cursus_users.length > 1 && (
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Cursus:</span>
            {user.cursus_users.map((c) => (
              <button
                key={c.cursus_id}
                id={`cursus-tab-${c.cursus_id}`}
                type="button"
                onClick={() => setSelectedCursusId(c.cursus_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCursusId === c.cursus_id
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{c.cursus.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  selectedCursusId === c.cursus_id ? 'bg-white/20 text-white' : 'bg-white text-blue-600 border border-slate-200'
                }`}>
                  lvl {c.level.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Level & Progress Bar Card */}
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {currentCursusUser?.cursus.name || '42 Cursus'} Progress
              </span>
              <span className="text-xl font-extrabold font-mono text-blue-600">
                Level {currentLevel.toFixed(2)}
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-700">
              {levelPercent}% to Level {levelInt + 1}
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${Math.min(100, Math.max(2, levelPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Skills, Projects, Achievements */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          id="tab-btn-skills"
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'skills'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Skills</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono text-slate-600">
            {skillsList.length}
          </span>
          {activeTab === 'skills' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          id="tab-btn-projects"
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'projects'
              ? 'text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Projects</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono text-slate-600">
            {filteredProjects.length}
          </span>
          {activeTab === 'projects' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        {user.achievements && user.achievements.length > 0 && (
          <button
            id="tab-btn-achievements"
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === 'achievements'
                ? 'text-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Achievements</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono text-slate-600">
              {user.achievements.length}
            </span>
            {activeTab === 'achievements' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* TAB 1: SKILLS SECTION */}
      {activeTab === 'skills' && (
        <div id="skills-section" className="space-y-4">
          {/* Controls: Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500">Sort:</span>
              <select
                value={skillSort}
                onChange={(e) => setSkillSort(e.target.value as any)}
                className="bg-white border border-slate-200 text-xs text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs"
              >
                <option value="level_desc">Highest Level First</option>
                <option value="level_asc">Lowest Level First</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>

          {skillsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillsList.map((skill) => (
                <SkillBar key={skill.id} skill={skill} maxLevel={21} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500">No skills matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECTS SECTION (Mandatory Requirement: Completed projects, including failed ones) */}
      {activeTab === 'projects' && (
        <div id="projects-section" className="space-y-4">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <button
              type="button"
              onClick={() => setProjectFilter('all')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                projectFilter === 'all'
                  ? 'bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">All Projects</span>
              <span className="text-lg font-bold font-mono text-slate-800">{totalProjects}</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectFilter('validated')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                projectFilter === 'validated'
                  ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-800 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 className="w-3 h-3" />
                <span>Validated</span>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-600">{validatedProjects}</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectFilter('failed')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                projectFilter === 'failed'
                  ? 'bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 text-rose-800 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-600">
                <XCircle className="w-3 h-3" />
                <span>Failed</span>
              </div>
              <span className="text-lg font-bold font-mono text-rose-600">{failedProjects}</span>
            </button>

            <button
              type="button"
              onClick={() => setProjectFilter('in_progress')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                projectFilter === 'in_progress'
                  ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 text-blue-800 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                <Clock className="w-3 h-3" />
                <span>In Progress</span>
              </div>
              <span className="text-lg font-bold font-mono text-blue-600">{inProgressProjects}</span>
            </button>
          </div>

          {/* Search bar for projects */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search projects (e.g. Libft, minishell)..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          {/* Projects List */}
          {filteredProjects.length > 0 ? (
            <div className="space-y-2.5">
              {filteredProjects.map((proj) => (
                <ProjectItem key={proj.id} projectUser={proj} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs text-slate-500">No projects found for the selected filter.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACHIEVEMENTS SECTION (Bonus view) */}
      {activeTab === 'achievements' && user.achievements && (
        <div id="achievements-section" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start gap-3 hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-0.5">{ach.name}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{ach.description}</p>
                {ach.tier && (
                  <span className="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                    {ach.tier} Tier
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
