// ----- Types of submissions -----
export const submissionList = {
  sprites: 1,
  games: 2,
  hacks: 7,
  reviews: 3,
  howtos: 4,
  sounds: 5,
  misc: 6,
};
export type SubmissionKinds = keyof typeof submissionList;

// ----- Submission Update -----
export interface SubmissionVersion {
  vid?: number;
  rid?: number;
  version?: string;
  message?: string;
  date?: number;
  type?: number;
  old?: number;
  data?: AnySubmission;
  decision?: string;
  in_queue?: number;
}

// ----- Submission Queue Purpose -----
export interface StaffVote {
  voteid?: number;
  type?: number;
  is_update?: number;
  uid?: number;
  rid?: number;
  decision?: number;
  message?: string;
  date?: number;
}
export const queueCode = {
  accepted: 0,
  new: 1,
  updated: 2,
  declined: 3,
};
export type QueueCode = keyof typeof queueCode;

// ----- MAIN SUBMISSION INTERFACES -----
export type AnySubmission = Sprite | Game;
interface Submission {
  id?: number;
  uid?: number;
  gid?: number;
  title?: string;
  created?: number;
  updated?: number;
  queue_code?: number;
  ghost?: number;
  accept_date?: number;
  update_accept_date?: number;
  decision?: string;
  catwords?: string;
  views?: number;
  old?: number;
  comments?: number;
}
export interface Sprite extends Submission {
  description?: string;
  author_override?: string;
  file?: string;
  thumbnail?: string;
  downloads?: number;
  file_mime?: string;
}
export interface Game extends Submission {
  description?: string;
  author_override?: string;
  file?: string;
  preview?: string;
  thumbnail?: string;
  downloads?: number;
  file_mime?: string;
}
