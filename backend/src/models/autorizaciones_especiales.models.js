import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_autorizaciones_especiales = async () => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto,
    u.nombre_usuario    AS emitido_por,
    de.created_at,
    de.updated_at
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  JOIN usuarios            AS u  ON de.emitido_por   = u.id_usuario
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  ORDER BY de.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_autorizaciones_especiales_id = async (id) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto,
    p.tipo_persona      AS tipo_persona,
    de.direccion_establecimiento,
    de.detalles_extra,
    u.nombre_usuario    AS emitido_por,
    de.created_at,
    de.updated_at
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  JOIN usuarios            AS u  ON de.emitido_por   = u.id_usuario
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE ae.id_documento = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_autorizaciones_especiales_vigentes = async () => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_autorizacion_especial = async (data) => {
  const query = `
    INSERT INTO autorizaciones_especiales (id_documento, nro_mesa, id_persona, id_operadora, id_centro, agencia_texto)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [
    data.id_documento,
    data.nro_mesa,
    data.id_persona,
    data.id_operadora,
    data.id_centro ?? null,
    data.agencia_texto ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_autorizacion_especial_id = async (id, data) => {
  const query = `
    UPDATE autorizaciones_especiales
    SET nro_mesa = $1, id_persona = $2, id_operadora = $3, id_centro = $4, agencia_texto = $5
    WHERE id_documento = $6 RETURNING *`;
  const values = [
    data.nro_mesa,
    data.id_persona,
    data.id_operadora,
    data.id_centro ?? null,
    data.agencia_texto ?? null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//busquedas avanzadas----------------------------------------------------

export const buscar_autorizaciones_por_persona = async (id_persona) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE ae.id_persona = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const buscar_autorizaciones_por_operadora = async (id_operadora) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE ae.id_operadora = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_operadora]);
  return result.rows;
};

export const buscar_autorizaciones_por_centro = async (id_centro) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  JOIN centros_apuesta     AS ca ON ae.id_centro     = ca.id_centro
  WHERE ae.id_centro = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_centro]);
  return result.rows;
};

export const buscar_autorizaciones_por_nro_mesa = async (nro_mesa) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE ae.nro_mesa = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [nro_mesa]);
  return result.rows;
};

export const buscar_autorizaciones_proximas_a_vencer = async () => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_vencimiento,
    ae.nro_mesa,
    p.ci_rif,
    p.razon_social      AS persona,
    op.razon_social     AS operadora,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN operadoras          AS op ON ae.id_operadora  = op.id_operadora
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
