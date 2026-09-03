import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_juegos = async () => {
  const query = `
  SELECT j.id_juego,
         j.nombre,
         j.estado
  FROM juegos AS j`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_juegos_id = async (id) => {
  const query = `
  SELECT j.id_juego,
         j.nombre,
         j.estado
  FROM juegos AS j
  WHERE j.id_juego = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_juegos = async (data) => {
  const query = `
    INSERT INTO juegos (nombre, estado)
    VALUES ($1, $2) RETURNING *`;
  const values = [data.nombre, data.estado];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_juegos_id = async (id) => {
  const query = `
    UPDATE juegos 
    SET estado = 'inactivo' 
    WHERE id_juego = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_juegos_id = async (id, data) => {
  const allowed = ["nombre", "estado"];
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
    UPDATE juegos SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id_juego = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_juegos_nombre = async (nombre) => {
  const query = `
  SELECT j.nombre, j.estado
  FROM juegos AS j
  WHERE j.nombre = $1`;
  const result = await pool.query(query, [nombre]);
  return !!result.rows[0];
};

export const get_juegos_estado_activo = async () => {
  const query = `
  SELECT j.nombre, j.estado, j.id_juego
  FROM juegos AS j
  WHERE j.estado = 'activo'`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_juegos_estado_inactivo = async () => {
  const query = `
  SELECT j.nombre, j.estado, j.id_juego
  FROM juegos AS j
  WHERE j.estado = 'inactivo'`;
  const result = await pool.query(query);
  return result.rows;
};
