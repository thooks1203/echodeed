export interface LocationData {
  city: string;
  state: string;
  country: string;
  fullLocation: string;
}

export interface WebSocketMessage {
  type: 'NEW_POST' | 'COUNTER_UPDATE' | 'POST_UPDATE' | 'CHALLENGE_COMPLETED';
  post?: any;
  counter?: any;
  challenge?: any;
}

export type FilterType = 'global' | 'local' | 'category';

export interface PostFilters {
  category?: string;
  city?: string;
  state?: string;
  country?: string;
}
