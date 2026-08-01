import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_participaciones = async () => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    de.fecha_entrega,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    rep.ci_rif              AS ci_rif_representante,
    rep.razon_social        AS representante,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia,
    u.nombre_usuario        AS emitido_por,
    de.created_at,
    de.updated_at
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  JOIN usuarios            AS u   ON de.emitido_por         = u.id_usuario
  LEFT JOIN personas       AS rep ON par.id_representante   = rep.id_persona
  ORDER BY de.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_participaciones_id = async (id) => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.fecha_emision,
    de.fecha_entrega,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    rep.ci_rif              AS ci_rif_representante,
    rep.razon_social        AS representante,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia,
    u.nombre_usuario        AS emitido_por,
    de.created_at,
    de.updated_at
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  JOIN usuarios            AS u   ON de.emitido_por         = u.id_usuario
  LEFT JOIN personas       AS rep ON par.id_representante   = rep.id_persona
  WHERE par.id_documento = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_participaciones_vigentes = async () => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_participacion = async (data) => {
  const query = `
    INSERT INTO participaciones (id_documento, nro_archivo, id_persona, id_representante, id_comercializador, id_licencia)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  const values = [
    data.id_documento,
    data.nro_archivo,
    data.id_persona,
    data.id_representante ?? null,
    data.id_comercializador,
    data.id_licencia,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_participacion_id = async (id, data) => {
  const query = `
    UPDATE participaciones
    SET nro_archivo = $1, id_persona = $2, id_representante = $3, id_comercializador = $4, id_licencia = $5
    WHERE id_documento = $6 RETURNING *`;
  const values = [
    data.nro_archivo,
    data.id_persona,
    data.id_representante ?? null,
    data.id_comercializador,
    data.id_licencia,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//busquedas avanzadas----------------------------------------------------

export const buscar_participaciones_por_persona = async (id_persona) => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE par.id_persona = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const buscar_participaciones_por_comercializador = async (id_comercializador) => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE par.id_comercializador = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_comercializador]);
  return result.rows;
};

export const buscar_participaciones_por_licencia = async (id_licencia) => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  WHERE par.id_licencia = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_licencia]);
  return result.rows;
};

export const buscar_participaciones_por_nro_archivo = async (nro_archivo) => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE par.nro_archivo ILIKE $1
  `;
  const result = await pool.query(query, [`%${nro_archivo}%`]);
  return result.rows;
};

export const buscar_participaciones_proximas_a_vencer = async () => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_vencimiento,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
