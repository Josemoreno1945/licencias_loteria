import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_usuarios = async () => {
  const query = `
  SELECT id_usuario, nombre_usuario , email , rol , estado
  FROM usuarios`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_usuarios_id = async (id) => {
  const query = ` 
  SELECT id_usuario, nombre_usuario , email , rol , estado 
  FROM usuarios
  WHERE id_usuario = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_usuarios_activos = async () => {
  const query = `
    SELECT nombre_usuario, email, rol, estado
    FROM usuarios
    WHERE estado = 'activo'
  `;
  const result = await pool.query(query);
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
    data.estado ?? "activo",
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_usuario_id = async (id) => {
  const query = `
    UPDATE usuarios 
    SET estado = 'inactivo' 
    WHERE id_usuario = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_usuario_id = async (id, data) => {
  const allowed = ["nombre_usuario", "email", "password_hash", "rol", "estado"];
  const fields = [];
  const values = [];
  let i = 1;

  for (const col of allowed) {
    if (data[col] !== undefined) {
      fields.push(`${col} = $${i}`);
      values.push(data[col]);
      i++;
    }
  }

  if (fields.length === 0) return [];

  const query = `
      UPDATE usuarios SET ${fields.join(", ")} 
      WHERE id_usuario = $${i} RETURNING *`;
  values.push(id);
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
