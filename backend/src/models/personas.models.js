import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_personas = async () => {
  const query = `
  SELECT ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_personas_id = async (id) => {
  const query = ` 
  SELECT ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas
  WHERE id_persona = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_persona = async (data) => {
  const query = `
    INSERT INTO personas (ci_rif,razon_social,tipo_persona,direccion_fiscal,telefono,email)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [
    data.ci_rif,
    data.razon_social,
    data.tipo_persona,
    data.direccion_fiscal,
    data.telefono,
    data.email,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//delete---tiene que ser un borrado logico no real ---------------------------------

//put---------------------------------------------------
export const actualizar_persona_id = async (id, data) => {
  const query = `
      UPDATE personas SET ci_rif = $1, razon_social = $2, tipo_persona = $3, direccion_fiscal = $4, telefono = $5 , email = $6
      WHERE id_persona = $7 RETURNING *`;
  const values = [
    data.ci_rif,
    data.razon_social,
    data.tipo_persona,
    data.direccion_fiscal,
    data.telefono,
    data.email,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_persona_email = async (email) => {
  const query = `
  SELECT ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas
  WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_ci_rif = async (ci_rif) => {
  const query = `
  SELECT ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas
  WHERE ci_rif = $1`;
  const result = await pool.query(query, [user_name]);
  return !!result.rows[0];
};
