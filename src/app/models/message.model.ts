export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  image: string | null;
  timestamp: Date;
}

