import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_personas = async () => {
  const query = `
  SELECT id_persona, ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_personas_id = async (id) => {
  const query = ` 
  SELECT id_persona, ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
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
  const allowed = [
    "ci_rif",
    "razon_social",
    "tipo_persona",
    "direccion_fiscal",
    "telefono",
    "email",
  ];
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
      UPDATE personas SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id_persona = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_persona_email = async (email) => {
  const query = `
  SELECT id_persona, ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas
  WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_ci_rif = async (ci_rif) => {
  const query = `
  SELECT id_persona, ci_rif , razon_social , tipo_persona , direccion_fiscal , telefono , email
  FROM personas
  WHERE ci_rif = $1`;
  const result = await pool.query(query, [ci_rif]);
  return !!result.rows[0];
};
