import { SpriteResponse } from './subSpritesType';

export type AnySubmissionResponse = SpriteResponse;
export const submissionList = {
  sprite: 'sprites',
  game: 'games',
  hack: 'hacks',
  review: 'reviews',
  tutorial: 'howtos',
  audio: 'sounds',
  misc: 'misc',
};
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
