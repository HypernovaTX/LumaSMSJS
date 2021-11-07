import SQL from '../lib/sql';
import CF from '../config';
import ERR, { errorObj } from '../lib/error';
import { sanitizeInput } from '../lib/globallib';
import { user, userList } from '../schema/userResponse';

export default class UserQuery {
  DB: SQL;
  userTable: string;
  groupTable: string;
  constructor() {
    this.DB = new SQL();
    this.userTable = `${CF.DB_PREFIX}users`;
    this.groupTable = `${CF.DB_PREFIX}groups`;
  }

  async listUsers(
    page: number,
    count: number = 25,
    column: string = '',
    asc: boolean = true,
    filter: [string, string][] = []
  ) {
    this.DB.buildSelect(this.userTable);

    // Apply filter
    if (filter.length > 0) {
      const statements = filter.map((item) => {
        let [name, value] = item;
        name = sanitizeInput(name);
        value = sanitizeInput(value);
        return `${name} = ${value}`;
      });
      this.DB.buildWhere(statements);
    }

    // Order and limit
    if (column) {
      this.DB.buildOrder([column], [asc]);
    }
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }
    return (await this.DB.runQuery()) as userList | errorObj;
  }
}
