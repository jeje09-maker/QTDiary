
export interface QTEntry {
  title: string;
  passage: string;
  verses: string;
  analysis: string;
  meditation: string; // AI의 묵상/통찰
  grace: string;      // 내가 말씀 가운데 받은 은혜 (추가)
  prayer: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  task: string;
}

export interface DiaryEntry {
  weather: string;
  schedule: ScheduleItem[]; // 변경: 문자열에서 객체 배열로
  diary: string;
  thanksgiving: string;
}

export interface DayData {
  date: string;
  qt: QTEntry;
  diary: DiaryEntry;
  completed: boolean;
}

export interface UserStats {
  talents: number;
  growthLevel: number; // 0: 씨앗, 1: 새싹, 2: 잎사귀, 3: 작은 나무, 4: 열매 맺는 나무
  streak: number;
  totalCompleted: number;
}
