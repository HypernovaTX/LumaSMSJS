import SQL from "../../lib/sql.js";
import CF from "../../config.js";

const DB = new SQL();
const userTable = `${CF.DB_PREFIX}users`;
const groupTable = `${CF.DB_PREFIX}groups`;