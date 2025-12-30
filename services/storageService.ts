import { VolunteerEvent, Feedback, UserProfile, UserActivityData } from '../types';
import { INITIAL_EVENTS } from '../constants';

const EVENTS_KEY = 'vbt_events_v1.0';
const USER_KEY = 'vbt_user_v1.0';
const BINGO_PREFIX = 'vbt_bingo_';
const HISTORY_PREFIX = 'vbt_history_';

// --- ユーザーセッション管理 ---
export const getUserProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Profile load error", e);
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
};

export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// --- ビンゴと活動履歴（ユーザー別） ---
const getBingoKey = (email: string) => `${BINGO_PREFIX}${email.replace(/\W/g, '_')}`;
const getHistoryKey = (email: string) => `${HISTORY_PREFIX}${email.replace(/\W/g, '_')}`;

export const getBingoProgress = (): string[] => {
  const user = getUserProfile();
  if (!user) return [];
  try {
    const data = localStorage.getItem(getBingoKey(user.email));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const stampCategory = (category: string): void => {
  const user = getUserProfile();
  if (!user) return;
  const current = getBingoProgress();
  if (!current.includes(category)) {
    localStorage.setItem(getBingoKey(user.email), JSON.stringify([...current, category]));
  }
};

export const getParticipatedEventIds = (): string[] => {
  const user = getUserProfile();
  if (!user) return [];
  try {
    const data = localStorage.getItem(getHistoryKey(user.email));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveParticipation = (eventId: string): void => {
  const user = getUserProfile();
  if (!user) return;
  const current = getParticipatedEventIds();
  if (!current.includes(eventId)) {
    localStorage.setItem(getHistoryKey(user.email), JSON.stringify([eventId, ...current]));
  }
};

export const hasParticipated = (eventId: string): boolean => {
  return getParticipatedEventIds().includes(eventId);
};

export const hasRegistered = (): boolean => {
  return getUserProfile() !== null;
};

// --- イベントデータ管理 ---
export const getEvents = (): VolunteerEvent[] => {
  try {
    const data = localStorage.getItem(EVENTS_KEY);
    if (data) return JSON.parse(data);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(INITIAL_EVENTS));
    return INITIAL_EVENTS;
  } catch (e) {
    return INITIAL_EVENTS;
  }
};

export const getEventById = (id: string): VolunteerEvent | undefined => {
  return getEvents().find(e => e.id === id);
};

export const saveEvent = (event: VolunteerEvent): void => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === event.id);
  const updated = index >= 0 ? [...events] : [event, ...events];
  if (index >= 0) updated[index] = event;
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
};

export const updateActivityReport = (id: string, report: string, imageUrl?: string): void => {
  const events = getEvents();
  const updated = events.map(e => e.id === id ? { ...e, activityReport: report, activityReportImage: imageUrl || e.activityReportImage } : e);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
};

export const addFeedback = (eventId: string, feedback: Feedback): void => {
  const events = getEvents();
  const updated = events.map(e => e.id === eventId ? { ...e, feedbacks: [feedback, ...(e.feedbacks || [])] } : e);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
};

// --- 管理用 ---
export const getAdminUserList = (): UserActivityData[] => {
  const user = getUserProfile();
  if (!user) return [];
  return [{
    ...user,
    stampCount: getBingoProgress().length,
    participationCount: getParticipatedEventIds().length,
    lastActivityDate: new Date().toISOString()
  }];
};

// --- バックアップ ---
export const exportData = (): string => {
  const allData: Record<string, string | null> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('vbt_') || key.startsWith('bingo_') || key.startsWith('history_'))) {
      allData[key] = localStorage.getItem(key);
    }
  }
  return JSON.stringify(allData, null, 2);
};

export const importData = (json: string): boolean => {
  try {
    const data = JSON.parse(json);
    Object.entries(data).forEach(([k, v]) => {
      if (typeof v === 'string') localStorage.setItem(k, v);
    });
    return true;
  } catch (e) {
    return false;
  }
};
