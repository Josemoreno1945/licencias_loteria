import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_bancos = async () => {
  const query = `
  SELECT id_banco, nombre , codigo , estado
  FROM bancos`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_bancos_id = async (id) => {
  const query = ` 
  SELECT id_banco, nombre , codigo , estado 
  FROM bancos
  WHERE id_banco = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_bancos_activos = async () => {
  const query = `
    SELECT id_banco, nombre , codigo , estado
    FROM bancos
    WHERE estado = 'activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_banco = async (data) => {
  const query = `
    INSERT INTO bancos (nombre,codigo,estado)
    VALUES ($1, $2, $3) RETURNING *`;
  const values = [data.nombre, data.codigo, data.estado];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_banco_id = async (id) => {
  const query = `
    UPDATE bancos
    SET estado = 'inactivo' 
    WHERE id_banco = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_banco_id = async (id, data) => {
  const allowed = ["nombre", "codigo", "estado"];
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
    UPDATE bancos SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id_banco = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
};

//otros---------------------

export const get_banco_nombre = async (nombre) => {
  const query = `
  SELECT nombre , codigo , estado  
  FROM bancos
  WHERE nombre = $1`;
  const result = await pool.query(query, [nombre]);
  return !!result.rows[0];
};
