import SQL from '../lib/sql';

import CF from '../config';
import ERR, { ErrorObj } from '../lib/error';
import { currentTime, objIntoArrays, sanitizeInput } from '../lib/globallib';
import { NoResponse } from '../lib/result';
import { User, UsernameChange, UserPermissionFull } from '../schema/userTypes';

export default class UserQuery {
  DB: SQL;
  userTable: string;
  groupTable: string;
  usernameUpdateTable: string;
  constructor() {
    this.DB = new SQL();
    this.userTable = `${CF.DB_PREFIX}users`;
    this.groupTable = `${CF.DB_PREFIX}groups`;
    this.usernameUpdateTable = `${CF.DB_PREFIX}username_change`;
  }

  // READ METHODS
  async listUsers(
    page: number,
    count: number,
    column: string = '',
    asc: boolean = true,
    filter: [string, string][] = []
  ) {
    this.DB.buildSelect(this.userTable);

    // Apply filter
    if (filter.length > 0) {
      const values: (string | number)[] = [];
      const statements = filter.map((item) => {
        let [name, value] = item;
        name = sanitizeInput(name);
        values.push(value);
        return `${name} = ?`;
      });
      this.DB.buildWhere(statements, values);
    }

    // Order and limit
    if (column) this.DB.buildOrder([column], [asc]);
    if (count) this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);

    // Execute and resolve
    return (await this.DB.runQuery()) as User[] | ErrorObj;
  }

  async findUserByUsername(
    input: string,
    page: number,
    count: number = 25,
    column: string = '',
    asc: boolean = true
  ) {
    this.DB.buildSelect(this.userTable);
    this.DB.buildCustomQuery(`WHERE username LIKE '${sanitizeInput(input)}%'`);

    // Order and limit
    if (column) {
      this.DB.buildOrder([column], [asc]);
    }
    if (count) {
      this.DB.buildCustomQuery(`LIMIT ${page * count}, ${count}`);
    }
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    return queryResult as User[] | ErrorObj;
  }

  async getUserById(id: number) {
    const uidWhere = 'WHERE uid = u.uid';
    const subWhere = `${uidWhere} AND queue_code = 0`;
    const countQuery = (table: string, where: string, as: string = '') => {
      return `(SELECT COUNT(*) FROM ${table} ${where}) ${as ? `AS ${as}` : ``}`;
    };
    this.DB.buildSelect(`${this.userTable} u`, [
      `u.*`,
      // ⬇️ Number of comments made by the user
      countQuery(`${CF.DB_PREFIX}comments`, uidWhere, `comments`),
      // ⬇️ Count all of the active submissions by this user
      `(SELECT ` +
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
    this.DB.buildWhere(`u.uid = ?`, [id]);
    const queryResult = await this.DB.runQuery();

    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    // Only return the 1st result if there's more
    const [user] = queryResult;
    return user as User | ErrorObj;
  }

  async getUserByIdLazy(id: number) {
    this.DB.buildSelect(this.userTable, '*');
    this.DB.buildWhere(`uid = ?`, [id]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }

    // Only return the 1st result if there's more
    const [user] = queryResult;
    return user as User | ErrorObj;
  }

  async getUserByUsername(username: string) {
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`username = ?`, [username]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    const [user] = queryResult;
    return user as User | ErrorObj;
  }

  async getUserByEmail(email: string) {
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`email = ?`, [email]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    const [user] = queryResult;
    return user as User | ErrorObj;
  }

  async getUserByGid(gid: number) {
    this.DB.buildSelect(this.userTable, '*');
    this.DB.buildWhere(`gid = ?`, [gid]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    // Only return the 1st result if there's more
    const [user] = queryResult;
    return user as User | ErrorObj;
  }

  async getUserByUsernameAndEmail(username: string, email: string) {
    this.DB.buildSelect(this.userTable);
    this.DB.buildWhere(`username = ? || email = ?`, [username, email]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    const [user] = queryResult;
    return user as User | ErrorObj;
  }

  async getRole(gid: number) {
    this.DB.buildSelect(this.groupTable, '*');
    this.DB.buildWhere(`gid = ?`, [gid]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userRoleNotFound');
    }
    const [role] = queryResult;
    return role as UserPermissionFull | ErrorObj;
  }

  async getUsernameChanges(uid: number) {
    this.DB.buildSelect(this.usernameUpdateTable);
    this.DB.buildWhere(`uid = ?`, [uid]);
    this.DB.buildOrder(['date'], [false]);
    const queryResult = await this.DB.runQuery();
    if (!Array.isArray(queryResult) || !queryResult.length) {
      return ERR('userNotFound');
    }
    return queryResult as UsernameChange[] | ErrorObj;
  }

  // WRITE METHODS
  async updateLastActivity(uid: number, timestamp: string, ip: string) {
    this.DB.buildUpdate(
      this.userTable,
      ['last_activity', 'last_ip'],
      [timestamp, ip]
    );
    this.DB.buildWhere(`uid = ?`, [uid]);
    this.DB.runQuery();
  }

  async createUser(
    username: string,
    email: string,
    password: string,
    ip: string
  ) {
    const timestamp = currentTime();
    const { columns, values } = objIntoArrays({
      username,
      email,
      password,
      registered_ip: ip,
      join_date: `${timestamp}`,
      last_activity: `${timestamp}`,
      items_per_page: `${CF.ROWS}`,
      gid: `${CF.DEFAULT_GROUP}`,
    });
    this.DB.buildInsert(this.userTable, columns, values);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }

  async updateUser(
    uid: number,
    updateColumns: string[],
    updateValues: string[]
  ) {
    this.DB.buildUpdate(this.userTable, updateColumns, updateValues);
    this.DB.buildWhere(`uid = ?`, [`${uid}`]);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }

  async deleteUser(uid: number) {
    this.DB.buildDelete(this.userTable, `uid = ?`, [uid]);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }

  async createRole(updateColumns: string[], updateValues: string[]) {
    this.DB.buildInsert(this.groupTable, updateColumns, updateValues);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }

  async updateRole(
    gid: number,
    updateColumns: string[],
    updateValues: string[]
  ) {
    this.DB.buildUpdate(this.groupTable, updateColumns, updateValues);
    this.DB.buildWhere(`gid = ?`, [gid]);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }

  async deleteRole(gid: number) {
    this.DB.buildDelete(this.userTable, `gid = ?`, [gid]);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }

  async usernameUpdate(uid: number, oldUsername: string, newusername: string) {
    const timestamp = currentTime();
    const columnNames = ['uid', 'old_username', 'new_username', 'date'];
    const columnValues = [`${uid}`, oldUsername, newusername, `${timestamp}`];
    this.DB.buildInsert(this.usernameUpdateTable, columnNames, columnValues);
    return (await this.DB.runQuery(true)) as NoResponse | ErrorObj;
  }
}
