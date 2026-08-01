import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_documentos_emitidos = async () => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    de.fecha_entrega,
    de.direccion_establecimiento,
    de.detalles_extra,
    u.nombre_usuario AS emitido_por,
    s.tipo_tramite,
    s.categoria_licencia,
    de.created_at,
    de.updated_at
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  ORDER BY de.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_documentos_emitidos_id = async (id) => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    de.fecha_entrega,
    de.direccion_establecimiento,
    de.detalles_extra,
    u.nombre_usuario AS emitido_por,
    s.tipo_tramite,
    s.categoria_licencia,
    de.created_at,
    de.updated_at
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  WHERE de.id_documento = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_documentos_emitidos_vigentes = async () => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    u.nombre_usuario AS emitido_por,
    s.tipo_tramite
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_documento_emitido = async (data) => {
  const query = `
    INSERT INTO documentos_emitidos (
      id_solicitud, tipo, tipo_emision, id_documento_anterior,
      numero_documento, papel_seguridad, estado_documento,
      fecha_expedicion, fecha_vencimiento, fecha_emision,
      fecha_entrega, direccion_establecimiento, detalles_extra, emitido_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`;
  const values = [
    data.id_solicitud,
    data.tipo,
    data.tipo_emision ?? "Inscripcion",
    data.id_documento_anterior ?? null,
    data.numero_documento,
    data.papel_seguridad,
    data.estado_documento ?? "vigente",
    data.fecha_expedicion,
    data.fecha_vencimiento,
    data.fecha_emision,
    data.fecha_entrega ?? null,
    data.direccion_establecimiento ?? null,
    data.detalles_extra ?? null,
    data.emitido_por,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_documento_emitido_id = async (id, data) => {
  const query = `
    UPDATE documentos_emitidos
    SET
      estado_documento          = $1,
      fecha_entrega             = $2,
      direccion_establecimiento = $3,
      detalles_extra            = $4
    WHERE id_documento = $5 RETURNING *`;
  const values = [
    data.estado_documento,
    data.fecha_entrega ?? null,
    data.direccion_establecimiento ?? null,
    data.detalles_extra ?? null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_documento_numero = async (numero_documento) => {
  const query = `
  SELECT numero_documento FROM documentos_emitidos
  WHERE numero_documento = $1`;
  const result = await pool.query(query, [numero_documento]);
  return !!result.rows[0];
};

export const get_documento_papel = async (papel_seguridad) => {
  const query = `
  SELECT papel_seguridad FROM documentos_emitidos
  WHERE papel_seguridad = $1`;
  const result = await pool.query(query, [papel_seguridad]);
  return !!result.rows[0];
};

//busquedas avanzadas----------------------------------------------------

export const buscar_documentos_por_tipo = async (tipo) => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    u.nombre_usuario AS emitido_por
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  WHERE de.tipo = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [tipo]);
  return result.rows;
};

export const buscar_documentos_por_estado = async (estado_documento) => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    u.nombre_usuario AS emitido_por
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  WHERE de.estado_documento = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [estado_documento]);
  return result.rows;
};

export const buscar_documentos_por_numero = async (numero_documento) => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    de.fecha_entrega,
    de.direccion_establecimiento,
    de.detalles_extra,
    u.nombre_usuario AS emitido_por,
    s.tipo_tramite
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  WHERE de.numero_documento ILIKE $1
  `;
  const result = await pool.query(query, [`%${numero_documento}%`]);
  return result.rows;
};

export const buscar_documentos_proximos_a_vencer = async () => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.tipo,
    de.estado_documento,
    de.fecha_vencimiento,
    u.nombre_usuario AS emitido_por,
    s.tipo_tramite
  FROM documentos_emitidos AS de
  JOIN solicitudes AS s ON de.id_solicitud = s.id_solicitudes
  JOIN usuarios    AS u ON de.emitido_por   = u.id_usuario
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const buscar_documentos_por_solicitud = async (id_solicitud) => {
  const query = `
  SELECT
    de.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    u.nombre_usuario AS emitido_por
  FROM documentos_emitidos AS de
  JOIN usuarios AS u ON de.emitido_por = u.id_usuario
  WHERE de.id_solicitud = $1
  `;
  const result = await pool.query(query, [id_solicitud]);
  return result.rows;
};
