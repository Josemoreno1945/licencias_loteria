import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_solicitudes = async () => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    op.razon_social     AS operadora,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.observaciones,
    s.justificacion_no_logrado,
    u.nombre_usuario    AS registrado_por,
    s.created_at,
    s.updated_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  JOIN usuarios       AS u  ON s.registrado_por      = u.id_usuario
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  LEFT JOIN operadoras        AS op ON s.id_operadora       = op.id_operadora
  ORDER BY s.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_solicitudes_id = async (id) => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    op.razon_social     AS operadora,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.observaciones,
    s.justificacion_no_logrado,
    u.nombre_usuario    AS registrado_por,
    s.created_at,
    s.updated_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  JOIN usuarios       AS u  ON s.registrado_por      = u.id_usuario
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  LEFT JOIN operadoras        AS op ON s.id_operadora       = op.id_operadora
  WHERE s.id_solicitudes = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_solicitudes_pendientes = async () => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    op.razon_social     AS operadora,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.observaciones,
    u.nombre_usuario    AS registrado_por,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  JOIN usuarios       AS u  ON s.registrado_por      = u.id_usuario
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  LEFT JOIN operadoras        AS op ON s.id_operadora       = op.id_operadora
  WHERE s.estado = 'Pendiente'
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_solicitud = async (data) => {
  const query = `
    INSERT INTO solicitudes (
      id_persona, id_comercializador, id_operadora,
      tipo_tramite, categoria_licencia, estado,
      descripcion_tramite, observaciones, justificacion_no_logrado,
      registrado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
  const values = [
    data.id_persona,
    data.id_comercializador ?? null,
    data.id_operadora ?? null,
    data.tipo_tramite,
    data.categoria_licencia ?? null,
    data.estado ?? "Pendiente",
    data.descripcion_tramite ?? null,
    data.observaciones ?? null,
    data.justificacion_no_logrado ?? null,
    data.registrado_por,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_solicitud_id = async (id, data) => {
  const query = `
    UPDATE solicitudes
    SET
      id_persona             = $1,
      id_comercializador     = $2,
      id_operadora           = $3,
      tipo_tramite           = $4,
      categoria_licencia     = $5,
      estado                 = $6,
      descripcion_tramite    = $7,
      observaciones          = $8,
      justificacion_no_logrado = $9
    WHERE id_solicitudes = $10 RETURNING *`;
  const values = [
    data.id_persona,
    data.id_comercializador ?? null,
    data.id_operadora ?? null,
    data.tipo_tramite,
    data.categoria_licencia ?? null,
    data.estado,
    data.descripcion_tramite ?? null,
    data.observaciones ?? null,
    data.justificacion_no_logrado ?? null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//busquedas avanzadas----------------------------------------------------

export const buscar_solicitudes_por_persona = async (id_persona) => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  WHERE s.id_persona = $1
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const buscar_solicitudes_por_tipo = async (tipo_tramite) => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    op.razon_social     AS operadora,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  LEFT JOIN operadoras        AS op ON s.id_operadora       = op.id_operadora
  WHERE s.tipo_tramite = $1
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [tipo_tramite]);
  return result.rows;
};

export const buscar_solicitudes_por_estado = async (estado) => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    op.razon_social     AS operadora,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  LEFT JOIN operadoras        AS op ON s.id_operadora       = op.id_operadora
  WHERE s.estado = $1
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [estado]);
  return result.rows;
};

export const buscar_solicitudes_por_comercializador = async (id_comercializador) => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p ON s.id_persona         = p.id_persona
  JOIN comercializadores AS c ON s.id_comercializador = c.id_comercializadores
  WHERE s.id_comercializador = $1
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [id_comercializador]);
  return result.rows;
};

export const buscar_solicitudes_por_usuario = async (id_usuario) => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.created_at,
    u.nombre_usuario    AS registrado_por
  FROM solicitudes AS s
  JOIN personas       AS p ON s.id_persona    = p.id_persona
  JOIN usuarios       AS u ON s.registrado_por = u.id_usuario
  LEFT JOIN comercializadores AS c ON s.id_comercializador = c.id_comercializadores
  WHERE s.registrado_por = $1
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [id_usuario]);
  return result.rows;
};
