import SQL from '../lib/sql';
import CF from '../config';
import ERR, { errorObj } from '../lib/error';
import { sanitizeInput } from '../lib/globallib';
import { User, UserList, UserPermissions } from '../schema/userResponse';

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

  async getUserById(id: number) {
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
    this.DB.buildWhere(`u.uid = ${id.toString()}`);
    const queryResult = await this.DB.runQuery(); // Only return the 1st result if there's more

    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }

    const [user] = queryResult;
    return user as User | errorObj;
  }

  async getUserByIdLazy(id: number) {
    this.DB.buildSelect(this.userTable, '*');
    this.DB.buildWhere(`uid = ${id.toString()}`);
    const queryResult = await this.DB.runQuery(); // Only return the 1st result if there's more

    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }

    const [user] = queryResult;
    return user as User | errorObj;
  }

  async getUserByUsername(username: string) {
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`username = '${sanitizeInput(username)}'`);
    const queryResult = await this.DB.runQuery();

    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }

    const [user] = queryResult;
    return user as User | errorObj;
  }

  async getUserByUsernameAndEmail(username: string, email: string) {
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(
      `username = '${sanitizeInput(username)}' 
        || email = '${sanitizeInput(email)}'`
    );
    const queryResult = await this.DB.runQuery();

    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }

    const [user] = queryResult;
    return user as User | errorObj;
  }

  async updateLastActivity(uid: number, timestamp: string, ip: string) {
    this.DB.buildUpdate(
      this.userTable,
      ['last_activity', 'last_ip'],
      [timestamp, ip]
    );
    this.DB.buildWhere(`uid = ${uid.toString()}`);
    this.DB.runQuery();
  }

  async getPermissions(gid: number) {
    this.DB.buildSelect(this.groupTable, '*');
    this.DB.buildWhere(`gid = ${gid}`);
    const queryResult = await this.DB.runQuery();

    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userRoleNotFound');
    }

    const [role] = queryResult;
    return role as UserPermissions | errorObj;
  }
}
