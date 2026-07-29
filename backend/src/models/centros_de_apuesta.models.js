import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_centros_apuesta = async () => {
  const query = `
  SELECT c.razon_social ,p.ci_rif,p.razon_social, ca.nombre_agencia, ca.direccion,ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_centros_apuesta_id = async (id) => {
  const query = ` 
  SELECT c.razon_social ,p.ci_rif,p.razon_social, ca.nombre_agencia, ca.direccion,ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.id_centro=$1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_centros_apuesta_activos = async () => {
  const query = `
  SELECT c.razon_social ,p.ci_rif,p.razon_social, ca.nombre_agencia, ca.direccion,ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.estado='activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_centros_apuesta = async (data) => {
  const query = `
    INSERT INTO centros_apuesta (id_comercializador, id_persona,nombre_agencia,direccion,estado)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *;
  `;
  const values = [
    data.id_comercializador, 
    data.id_persona,         
    data.nombre_agencia,     
    data.direccion,          
    data.estado || 'activo', 
  ];
  const result = await pool.query(query, values);
  return result.rows[0]; 
};

// delete (borrado lógico) ---------------------------------
export const eliminar_centros_apuesta_id = async (id) => {
  const query = `
    UPDATE centros_apuesta
    SET estado = 'inactivo' 
    WHERE id_centro = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_centros_apuesta_id = async (id, data) => {
  const query = `
      UPDATE centros_apuesta SET nombre_agencia = $1, direccion = $2, estado = $3
      WHERE id_centro = $4 RETURNING *`;
  const values = [
    data.nombre_agencia,
    data.direccion,
    data.estado,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_centros_apuesta_nombre = async (email) => {
  const query = `
  SELECT c.razon_social ,p.ci_rif,p.razon_social, ca.nombre_agencia, ca.direccion,ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.nombre_agencia=$1
  `;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};
