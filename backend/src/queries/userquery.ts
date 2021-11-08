import SQL from '../lib/sql';
import CF from '../config';
import ERR, { errorObj } from '../lib/error';
import { sanitizeInput } from '../lib/globallib';
import { User, UserList } from '../schema/userResponse';

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
    return (await this.DB.runQuery()) as UserList | errorObj;
  }

  async showUserById(id: number) {
    const uidWhere = 'WHERE uid = u.uid';
    const subWhere = `${uidWhere} AND queue_code = 0`;
    const countQuery = (table: string, where: string, as: string = '') => {
      return `(SELECT COUNT(*) FROM ${table} ${where}) ${as ? `AS ${as}` : ``}`;
    };
    this.DB.buildSelect(`${this.userTable} u`, [
      `u.*`,
      countQuery(`${CF.DB_PREFIX}comments`, uidWhere, `comments`), // Number of comments made by the user
      `(SELECT ` + // Count all of the active submissions by this user
        countQuery(`${CF.DB_PREFIX}submission_games`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_hacks`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_howtos`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_misc`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_reviews`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_sounds`, subWhere) +
        `+` +
        countQuery(`${CF.DB_PREFIX}submission_sprites`, subWhere) +
        `) AS submissions`,
    ]);
    this.DB.buildWhere(`u.uid = ${sanitizeInput(id.toString())}`);
    const queryResult = await this.DB.runQuery(); // Only return the 1st result if there's more

    if (!Array.isArray(queryResult)) {
      return ERR('userNotFound');
    }

    const [user] = queryResult;
    return user as User | errorObj;
  }
}
