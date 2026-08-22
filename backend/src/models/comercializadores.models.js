import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_comercializadores = async () => {
  const query = `
  SELECT id_comercializadores, rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_comercializadores_id = async (id) => {
  const query = ` 
  SELECT id_comercializadores, rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores
  WHERE id_comercializadores = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_comercializadores_activos = async () => {
  const query = `
    SELECT id_comercializadores, rif , razon_social , direccion_fiscal , telefono , email , estado
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
  const allowed = ["rif", "razon_social", "direccion_fiscal", "telefono", "email", "estado"];
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
    UPDATE comercializadores SET ${fields.join(", ")}
    WHERE id_comercializadores = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_comercializador_email = async (email) => {
  const query = `
  SELECT id_comercializadores, rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores
  WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_comercializador_rif = async (rif) => {
  const query = `
  SELECT id_comercializadores, rif , razon_social , direccion_fiscal , telefono , email , estado
  FROM comercializadores
  WHERE rif = $1`;
  const result = await pool.query(query, [rif]);
  return !!result.rows[0];
};

// Detalle completo: datos del comercializador + sus representantes activos
export const get_comercializador_detalle_completo = async (id) => {
  // Datos del comercializador
  const comQuery = `
  SELECT id_comercializadores, rif, razon_social, direccion_fiscal, telefono, email, estado
  FROM comercializadores
  WHERE id_comercializadores = $1
  `;
  const comResult = await pool.query(comQuery, [id]);
  if (!comResult.rows[0]) return null;

  // Representantes activos vinculados
  const repQuery = `
  SELECT cr.id_c_representantes, cr.id_persona, cr.cargo, cr.estado,
         p.razon_social, p.ci_rif, p.telefono, p.email
  FROM comercializadores_representantes AS cr
  JOIN personas AS p ON cr.id_persona = p.id_persona
  WHERE cr.id_comercializador = $1 AND cr.estado = 'activo'
  ORDER BY p.razon_social
  `;
  const repResult = await pool.query(repQuery, [id]);

  return {
    ...comResult.rows[0],
    representantes: repResult.rows,
  };
};
