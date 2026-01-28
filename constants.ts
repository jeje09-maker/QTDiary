
import { DayData, QTEntry, DiaryEntry } from './types';

export const INITIAL_QT: QTEntry = {
  title: '',
  passage: '',
  verses: '',
  analysis: '',
  meditation: '',
  grace: '',
  prayer: ''
};

export const INITIAL_DIARY: DiaryEntry = {
  weather: '☀️ 맑음',
  schedule: [], // 변경: 빈 배열
  diary: '',
  thanksgiving: ''
};

export const GROWTH_LEVELS = [
  { name: '씨앗', icon: '🌱', threshold: 0 },
  { name: '새싹', icon: '🌿', threshold: 3 },
  { name: '잎사귀', icon: '🍃', threshold: 7 },
  { name: '작은 나무', icon: '🌳', threshold: 15 },
  { name: '열매 맺는 나무', icon: '🍎', threshold: 30 }
];

export const STORAGE_KEY = 'qt_diary_data_v1';
export const STATS_KEY = 'qt_diary_stats_v1';
