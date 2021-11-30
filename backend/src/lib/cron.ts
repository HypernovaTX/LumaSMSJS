import { schedule, ScheduledTask } from 'node-cron';

import { ErrorObj, isError } from './error';
import CF from '../config';
import SubmissionQuery from '../queries/submissionQuery';
import {
  AnySubmissionResponse,
  queue_code,
  submissionKindArray,
  submissionList,
  submissionToDelete,
} from '../schema/submissionType';

export default class Cron {
  job: ScheduledTask;
  constructor() {
    this.job = schedule('0 0 * * * *', async () => {
      this.executions();
      console.log('midnight!!!!!!');
    });
    console.log('Cron initialized.');
    CF.DEBUG_MODE && console.log(this.job);
  }

  executions() {
    // Review/delete submissions to delete
    this.deleteSubmissions();
  }

  private async deleteSubmissions() {
    // First obtain the submission data to ensure they exists
    const deleteListQuery = new SubmissionQuery();
    const getDeleteList = await deleteListQuery.getSubmissionToDeleteList();
    if (isError(getDeleteList)) {
      return getDeleteList as ErrorObj;
    }
    const deleteList = getDeleteList as submissionToDelete[];

    // Util constants
    const subNumbers = Object.values(submissionList);
    const currentTime = Math.floor(Date.now() / 1000);
    // Start check and delete each of the item to be deleted
    deleteList.forEach(async (item) => {
      // Ensure the submission deletion type is correct, otherwise, remove it
      const correctSubTypeNumber = subNumbers.find((i) => i === item.type);
      if (!correctSubTypeNumber) {
        deleteListQuery.deleteScheduledDeletion(item.cronid);
        return;
      }
      // Skip if it's not time yet
      if (item.time <= currentTime) {
        return;
      }
      // First get the submission info
      const query = new SubmissionQuery(submissionKindArray[item.type]);
      const data = await query.getSubmissionById(item.id);
      // Err when getting the submission data
      if (isError(data)) {
        return;
      }
      const validSubmission = data as AnySubmissionResponse;
      // Ensure they are still declined, then delete
      if (validSubmission.queue_code === queue_code.declined) {
        query.deleteSubmission(item.id);
      }
    });
  }
}
