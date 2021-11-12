import { staffVoteList } from './submissionType';

export interface Sprite {
  id?: number;
  uid?: number;
  title?: string;
  description?: string;
  author_override?: string;
  created?: number;
  updated?: number;
  queue_code?: number;
  ghost?: number;
  accept_date?: number;
  update_accept_date?: number;
  decision?: staffVoteList;
  catwords?: string;
  file?: string;
  thumbnail?: string;
  views?: number;
  downloads?: number;
  file_mime?: string;
  old?: number;
  comments?: number;
}
export interface SpriteResponse extends Omit<Sprite, 'decision'> {
  decision?: string;
}
