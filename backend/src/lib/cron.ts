import { schedule, ScheduledTask } from 'node-cron';

import CF from '../config';

export default class Cron {
  job: ScheduledTask;

  constructor() {
    this.job = schedule('0 0 * * * *', async () => {
      this.executions();
    });
  }

  executions() {}
}
