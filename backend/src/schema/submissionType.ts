import { SpriteResponse } from './subSpritesType';

export type AnySubmissionResponse = SpriteResponse;
export const submissionList = {
  sprites: 'sprites',
  games: 'games',
  hacks: 'hacks',
  reviews: 'reviews',
  howtos: 'howtos',
  sounds: 'sounds',
  misc: 'misc',
};
export interface SubmissionUpdateResponse {
  vid?: number;
  rid?: number;
  version?: string;
  change?: string;
  date?: number;
  type?: number;
  old?: number;
}
export type submissionKinds = keyof typeof submissionList;
export interface submissionFilter {
  column: string;
  value: string;
}
export interface staffVote {
  uid: number;
  accept: boolean;
  reason: string;
}
export type staffVoteList = staffVote[];
export const queue_code = {
  accepted: 0,
  new: 1,
  updated: 2,
};
