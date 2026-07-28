import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_comercializadores = async () => {
  const query = `
  SELECT rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_comercializadores_id = async (id) => {
  const query = ` 
  SELECT rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores
  WHERE id_comercializadores = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_comercializadores_activos = async () => {
  const query = `
    SELECT rif , razon_social , direccion_fiscal , telefono , email , estado
    FROM comercializadores
    WHERE estado = 'activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_comercializador = async (data) => {
  const query = `
    INSERT INTO comercializadores (rif,razon_social,direccion_fiscal,telefono,email,estado)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [
    data.rif,
    data.razon_social,
    data.direccion_fiscal,
    data.telefono,
    data.email,
    data.estado,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_comercializador_id = async (id) => {
  const query = `
    UPDATE comercializadores 
    SET estado = 'inactivo' 
    WHERE id_comercializadores = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_comercializador_id = async (id, data) => {
  const query = `
      UPDATE comercializadores SET rif = $1, razon_social = $2, direccion_fiscal = $3, telefono = $4, email = $5, estado = $6
      WHERE id_comercializadores = $7 RETURNING *`;
  const values = [
    data.rif,
    data.razon_social,
    data.direccion_fiscal,
    data.telefono,
    data.email,
    data.estado,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_comercializador_email = async (email) => {
  const query = `
  SELECT rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores
  WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_comercializador_rif = async (rif) => {
  const query = `
  SELECT rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores
  WHERE rif = $1`;
  const result = await pool.query(query, [rif]);
  return !!result.rows[0];
};
