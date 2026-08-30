export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  type: string;
  data: string; // base64
  mimeType: string;
}

export interface AppState {
  currentMode: 'personal' | 'business';
  currentView: 'ai' | 'contact' | 'admin';
  language: string;
  history: Message[];
}

export interface Suggestion {
  title: string;
  description: string;
  prompt: string;
  icon: string;
}

export interface Ad {
  id: string;
  name: string;
  code: string; // HTML/Script code for the ad
  placement: 'sidebar' | 'chat_top' | 'chat_bottom' | 'sidebar_top' | 'chat_middle' | 'global_header';
  active: boolean;
  createdAt: number;
}
