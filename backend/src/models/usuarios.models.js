import { pool } from "../db.js";

//get
export const get_usuarios = async () => {
  const query = "";
  const result = await pool.query(query);
  return result.rows;
};

export const get_usuarios_id = async (id) => {
  const query = "";
  const result = await pool.query(query, [id]);
  return result.rows;
};

//post----
export const crear_usuario = async (data) => {
  const query =
    "INSERT INTO users (first_name, last_name, user_name, password, id_roles, email, status, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
  const values = [
    data.first_name,
    data.last_name,
    data.user_name,
    data.password,
    data.id_roles,
    data.email,
    data.status,
    data.date,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//delete---tiene que ser un borrado logico no real ---------------------------------
export const eliminar_usuario_id = async (id) => {
  const query = "DELETE FROM users WHERE id_users = $1";
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put-----ultimo-----
export const actualizar_usuario_id = async (id, data) => {
  const query =
    "UPDATE users SET first_name = $1, last_name = $2, user_name = $3, password = $4, id_roles = $5, email = $6, status = $7, date = $8  WHERE id_users = $9 RETURNING *";
  const values = [
    data.first_name,
    data.last_name,
    data.user_name,
    data.password,
    data.id_roles,
    data.email,
    data.status,
    data.date,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros---------------------

export const get_usuario_email = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_nombre_de_usuario = async (user_name) => {
  const query = "SELECT * FROM users WHERE user_name = $1";
  const result = await pool.query(query, [user_name]);
  return !!result.rows[0];
};
