import { Sprite, SpriteResponse } from './subSpritesType';

export type AnySubmissionResponse = SpriteResponse;
export type AnySubmission = Sprite;
export const submissionList = {
  sprites: 1,
  games: 2,
  hacks: 7,
  reviews: 3,
  howtos: 4,
  sounds: 5,
  misc: 6,
};
export interface SubmissionVersionResponse {
  vid?: number;
  rid?: number;
  version?: string;
  message?: string;
  date?: number;
  type?: number;
  old?: number;
  data?: AnySubmissionResponse;
  decision?: string;
  in_queue?: number;
}
export type submissionKinds = keyof typeof submissionList;
export interface submissionFilter {
  column: string;
  value: string;
}
export interface staffVote {
  uid: number;
  decision: number;
  reason: string;
}
export type staffVoteList = staffVote[];
export const queue_code = {
  accepted: 0,
  new: 1,
  updated: 2,
  declined: 3,
};
