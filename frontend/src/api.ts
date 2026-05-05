export const JAVA_API = 'http://localhost:8081';
export const NODE_API = 'http://localhost:3000';

export type Habit = {
  id: number;
  name: string;
  description: string;
};

export type Reminder = {
  id: number;
  text: string;
};
