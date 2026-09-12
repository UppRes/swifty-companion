export interface User42ImageVersions {
  large?: string;
  medium?: string;
  small?: string;
  micro?: string;
}

export interface User42Image {
  link: string | null;
  versions?: User42ImageVersions;
}

export interface Skill42 {
  id: number;
  name: string;
  level: number;
}

export interface CursusUser42 {
  id: number;
  grade?: string | null;
  level: number;
  skills: Skill42[];
  cursus_id: number;
  cursus: {
    id: number;
    name: string;
    slug: string;
  };
  begin_at?: string;
  end_at?: string | null;
  has_coalition?: boolean;
}

export interface Project42Detail {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
}

export interface ProjectUser42 {
  id: number;
  occurrence: number;
  final_mark: number | null;
  status: 'finished' | 'in_progress' | 'searching_a_group' | 'waiting_for_correction' | string;
  'validated?'?: boolean | null;
  current_team_id?: number | null;
  project: Project42Detail;
  cursus_ids: number[];
  marked_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Campus42 {
  id: number;
  name: string;
  time_zone: string;
  language?: {
    name: string;
    identifier: string;
  };
  country: string;
  city: string;
}

export interface Achievement42 {
  id: number;
  name: string;
  description: string;
  tier?: string;
  kind?: string;
  visible?: boolean;
  image?: string;
}

export interface User42 {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name?: string;
  displayname: string;
  phone?: string | null;
  image: User42Image;
  'staff?'?: boolean;
  correction_point: number;
  pool_month?: string | null;
  pool_year?: string | null;
  location?: string | null;
  wallet: number;
  cursus_users: CursusUser42[];
  projects_users: ProjectUser42[];
  campus?: Campus42[];
  achievements?: Achievement42[];
  titles?: Array<{ id: number; name: string }>;
  isDemo?: boolean;
}

export interface ApiStatus {
  hasCredentials: boolean;
  hasToken: boolean;
  tokenExpiresInSeconds: number | null;
  tokenExpiresAt: number | null;
  tokenReuseCount: number;
  lastRefreshedAt: string | null;
  isDemoMode: boolean;
  environment: string;
}

export interface SearchHistoryItem {
  login: string;
  displayName: string;
  avatar?: string | null;
  level?: number;
  timestamp: number;
}
