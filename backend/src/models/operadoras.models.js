import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_operadoras = async () => {
  const query = `
  SELECT id_operadora, rif , razon_social , direccion_fiscal , estado
  FROM operadoras`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_operadoras_id = async (id) => {
  const query = ` 
  SELECT id_operadora, rif , razon_social , direccion_fiscal , estado
  FROM operadoras
  WHERE id_operadora = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_operadoras_activas = async () => {
  const query = `
    SELECT id_operadora, rif , razon_social , direccion_fiscal , estado
    FROM operadoras
    WHERE estado = 'activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_operadora = async (data) => {
  const query = `
    INSERT INTO operadoras (rif,razon_social,direccion_fiscal,estado)
    VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [
    data.rif,
    data.razon_social,
    data.direccion_fiscal,
    data.estado,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_operadora_id = async (id) => {
  const query = `
    UPDATE operadoras 
    SET estado = 'inactivo' 
    WHERE id_operadora = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_operadora_id = async (id, data) => {
  const allowed = ["rif", "razon_social", "direccion_fiscal", "estado"];
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
    UPDATE operadoras SET ${fields.join(", ")}
    WHERE id_operadora = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_operadora_rif = async (rif) => {
  const query = `
  SELECT id_operadora, rif , razon_social , direccion_fiscal , estado
  FROM operadoras
  WHERE rif = $1`;
  const result = await pool.query(query, [rif]);
  return !!result.rows[0];
};
