import { pool } from "../db.js";

export const get_usuario_para_login = async (email) => {
  const query = `
    SELECT id_usuario, nombre_usuario, email, password_hash, rol, estado
    FROM usuarios
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0]; // undefined si no existe
};
