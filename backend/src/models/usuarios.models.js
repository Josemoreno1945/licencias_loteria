import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_usuarios = async () => {
  const query = `
  SELECT nombre_usuario , email , rol , estado
  FROM usuarios`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_usuarios_id = async (id) => {
  const query = ` 
  SELECT nombre_usuario , email , rol , estado 
  FROM usuarios
  WHERE id_usuario = 1$
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_usuario = async (data) => {
  const query = `
    INSERT INTO usuarios (nombre_usuario,email,password_hash,rol,estado)
    VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [
    data.nombre_usuario,
    data.email,
    data.password_hash,
    data.rol,
    data.estado,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//delete---tiene que ser un borrado logico no real ---------------------------------
/*export const eliminar_usuario_id = async (id) => {
  const query = "DELETE FROM users WHERE id_users = $1";
  const result = await pool.query(query, [id]);
  return result.rows;
};
*/

//put---------------------------------------------------
export const actualizar_usuario_id = async (id, data) => {
  const query = `
      UPDATE usuarios SET nombre_usuario = $1, email = $2, password_hash = $3, rol = $4, estado = $5 
      WHERE id_usuario = $6 RETURNING *`;
  const values = [
    data.nombre_usuario,
    data.email,
    data.password_hash,
    data.rol,
    data.estado,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros---------------------

export const get_usuario_email = async (email) => {
  const query = `
  SELECT nombre_usuario , email , rol , estado  
  FROM usuarios
  WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_nombre_de_usuario = async (user_name) => {
  const query = `
  SELECT nombre_usuario , email , rol , estado
  FROM usuarios 
  WHERE nombre_usuario = $1`;
  const result = await pool.query(query, [user_name]);
  return !!result.rows[0];
};
