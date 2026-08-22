import { pool } from "../db.js";

const REPRESENTANTES_SUBQUERY = `(
  SELECT COALESCE(json_agg(json_build_object(
    'id_persona', rp.id_persona,
    'ci_rif', rpp.ci_rif,
    'razon_social', rpp.razon_social,
    'cargo', rp.cargo,
    'rol', rp.rol
  )) FILTER (WHERE rpp.id_persona IS NOT NULL), '[]'::json)
  FROM participaciones_representantes rp
  LEFT JOIN personas rpp ON rp.id_persona = rpp.id_persona
  WHERE rp.id_documento = par.id_documento
)`;

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
    par.nro_archivo,
    par.tipo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia,
    aut.numero_documento    AS numero_autorizacion_previa,
    u.nombre_usuario        AS emitido_por,
    de.created_at,
    de.updated_at
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  LEFT JOIN autorizaciones_especiales AS ae ON par.id_autorizacion_previa = ae.id_documento
  LEFT JOIN documentos_emitidos AS aut ON ae.id_documento       = aut.id_documento
  JOIN usuarios            AS u   ON de.emitido_por       = u.id_usuario
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
    de.observaciones            AS observaciones_documento,
    de.detalles_extra,
    par.nro_archivo,
    par.tipo,
    par.numero_lot,
    par.fecha_solicitud,
    par.territorio,
    par.observaciones,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia,
    aut.numero_documento    AS numero_autorizacion_previa,
    p.tipo_persona          AS tipo_persona,
    de.direccion_establecimiento,
    u.nombre_usuario        AS emitido_por,
    de.created_at,
    de.updated_at,
    ${REPRESENTANTES_SUBQUERY} AS representantes
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  LEFT JOIN autorizaciones_especiales AS ae ON par.id_autorizacion_previa = ae.id_documento
  LEFT JOIN documentos_emitidos AS aut ON ae.id_documento       = aut.id_documento
  JOIN usuarios            AS u   ON de.emitido_por       = u.id_usuario
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
    par.tipo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_participacion = async (data) => {
  const query = `
    INSERT INTO participaciones (
      id_documento, nro_archivo, id_persona, id_comercializador,
      id_licencia, id_autorizacion_previa, tipo, numero_lot,
      fecha_solicitud, territorio, observaciones
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
  const values = [
    data.id_documento,
    data.nro_archivo,
    data.id_persona,
    data.id_comercializador,
    data.id_licencia ?? null,
    data.id_autorizacion_previa ?? null,
    data.tipo,
    data.numero_lot ?? null,
    data.fecha_solicitud ?? null,
    data.territorio ?? null,
    data.observaciones ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_participacion_id = async (id, data) => {
  const allowed = [
    "nro_archivo", "id_persona", "id_comercializador",
    "id_licencia", "id_autorizacion_previa", "tipo", "numero_lot",
    "fecha_solicitud", "territorio", "observaciones",
  ];
  const fields = [];
  const values = [];
  let i = 1;

  for (const col of allowed) {
    if (data[col] !== undefined) {
      fields.push(`${col} = $${i}`);
      values.push(data[col] ?? null);
      i++;
    }
  }

  if (fields.length === 0 && !data.representantes) {
    return [];
  }

  if (fields.length > 0) {
    await pool.query(
      `UPDATE participaciones SET ${fields.join(", ")}
       WHERE id_documento = $${i} RETURNING *`,
      [...values, id],
    );
  }

  // Representantes legales (N:M): se reemplazan por completo
  if (data.representantes) {
    const reps = (Array.isArray(data.representantes) ? data.representantes : [])
      .map((r) => (r && r.id_persona ? r : { id_persona: r }))
      .filter((r) => r.id_persona);

    await pool.query(`DELETE FROM participaciones_representantes WHERE id_documento = $1`, [id]);

    for (const rep of reps) {
      await pool.query(
        `INSERT INTO participaciones_representantes (id_documento, id_persona, rol, cargo)
         VALUES ($1, $2, $3, $4)`,
        [id, rep.id_persona, rep.rol ?? null, rep.cargo ?? null],
      );
    }
  }

  return get_participaciones_id(id);
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
    par.tipo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
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
    par.tipo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
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
    par.tipo,
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
    par.tipo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
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
    par.tipo,
    p.ci_rif,
    p.razon_social          AS persona,
    c.razon_social          AS comercializador,
    lic.numero_documento    AS numero_licencia
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c   ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN licencias           AS l   ON par.id_licencia        = l.id_documento
  LEFT JOIN documentos_emitidos AS lic ON l.id_documento         = lic.id_documento
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
