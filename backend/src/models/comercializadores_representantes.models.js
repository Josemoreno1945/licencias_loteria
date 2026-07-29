import { pool } from "../db.js";

// get --------------------------------------------------------------------
export const get_representantes = async () => {
  const query = `
    SELECT cr.id_c_representantes, cr.id_comercializador, cr.id_persona, cr.cargo, cr.estado,
           c.razon_social as comercializador_razon_social, c.rif as comercializador_rif,
           p.razon_social as persona_razon_social, p.ci_rif as persona_ci_rif
    FROM comercializadores_representantes cr
    JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
    JOIN personas p ON cr.id_persona = p.id_persona
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_representante_id = async (id) => {
  const query = `
    SELECT cr.id_c_representantes, cr.id_comercializador, cr.id_persona, cr.cargo, cr.estado,
           c.razon_social as comercializador_razon_social, c.rif as comercializador_rif,
           p.razon_social as persona_razon_social, p.ci_rif as persona_ci_rif
    FROM comercializadores_representantes cr
    JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
    JOIN personas p ON cr.id_persona = p.id_persona
    WHERE cr.id_c_representantes = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

// get by persona (Importante para la búsqueda integral por cédula/rif)
export const get_representantes_by_persona = async (id_persona) => {
  const query = `
    SELECT cr.id_c_representantes, cr.id_comercializador, cr.id_persona, cr.cargo, cr.estado,
           c.razon_social as comercializador_razon_social, c.rif as comercializador_rif
    FROM comercializadores_representantes cr
    JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
    WHERE cr.id_persona = $1
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

// get by comercializador
export const get_representantes_by_comercializador = async (id_comercializador) => {
  const query = `
    SELECT cr.id_c_representantes, cr.id_comercializador, cr.id_persona, cr.cargo, cr.estado,
           p.razon_social as persona_razon_social, p.ci_rif as persona_ci_rif
    FROM comercializadores_representantes cr
    JOIN personas p ON cr.id_persona = p.id_persona
    WHERE cr.id_comercializador = $1
  `;
  const result = await pool.query(query, [id_comercializador]);
  return result.rows;
};

// post ------------------------------------------------------------
export const crear_representante = async (data) => {
  const query = `
    INSERT INTO comercializadores_representantes (id_comercializador, id_persona, cargo, estado)
    VALUES ($1, $2, $3, $4) RETURNING *
  `;
  const values = [data.id_comercializador, data.id_persona, data.cargo, data.estado || 'activo'];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_representante_id = async (id) => {
  const query = `
    UPDATE comercializadores_representantes
    SET estado = 'inactivo' 
    WHERE id_c_representantes = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

// put ---------------------------------------------------
export const actualizar_representante_id = async (id, data) => {
  const query = `
    UPDATE comercializadores_representantes 
    SET cargo = $1, estado = $2 
    WHERE id_c_representantes = $3 
    RETURNING *
  `;
  const values = [data.cargo, data.estado, id];
  const result = await pool.query(query, values);
  return result.rows;
};

// otros ---------------------
export const check_duplicado_representante = async (id_comercializador, id_persona) => {
  const query = `
    SELECT id_c_representantes 
    FROM comercializadores_representantes
    WHERE id_comercializador = $1 AND id_persona = $2
  `;
  const result = await pool.query(query, [id_comercializador, id_persona]);
  return !!result.rows[0];
};
