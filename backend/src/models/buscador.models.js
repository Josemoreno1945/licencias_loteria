import { pool } from "../db.js";

const cleanString = (val) => (val == null ? "" : String(val));

const normalizeCiRif = (val) => cleanString(val).trim().toUpperCase().replace(/\s+/g, "");

const isUuid = (val) =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export const buscar_personas_por_ci_rif = async (ci_rif) => {
  const ci = normalizeCiRif(ci_rif);
  if (!ci) return [];
  const query = `
    SELECT
      p.id_persona,
      p.ci_rif,
      p.razon_social,
      p.tipo_persona,
      p.direccion_fiscal,
      p.telefono,
      p.email,
      (SELECT de.numero_documento
         FROM licencias l
         JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE l.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1) AS nro_licencia,
      (SELECT de.numero_documento
         FROM autorizaciones_especiales ae
         JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
        WHERE ae.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1) AS nro_autorizacion,
      (SELECT de.numero_documento
         FROM participaciones pa
         JOIN documentos_emitidos de ON pa.id_documento = de.id_documento
        WHERE pa.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1) AS nro_participacion,
      ARRAY_REMOVE(ARRAY[
        (CASE WHEN EXISTS (SELECT 1 FROM solicitudes s WHERE s.id_persona = p.id_persona) THEN 'Solicitud' ELSE NULL END),
        (CASE WHEN EXISTS (SELECT 1 FROM licencias l WHERE l.id_persona = p.id_persona) THEN 'Licencia' ELSE NULL END),
        (CASE WHEN EXISTS (SELECT 1 FROM participaciones pa WHERE pa.id_persona = p.id_persona) THEN 'Participación' ELSE NULL END),
        (CASE WHEN EXISTS (SELECT 1 FROM autorizaciones_especiales ae WHERE ae.id_persona = p.id_persona) THEN 'Autorización Especial' ELSE NULL END)
      ], NULL) AS documentos
    FROM personas p
    WHERE p.ci_rif ILIKE $1
    ORDER BY p.razon_social ASC
  `;
  const result = await pool.query(query, [`%${ci}%`]);
  return result.rows;
};

export const buscar_personas_avanzado = async (filters = {}) => {
  const {
    ci_rif,
    tipo_persona,
    estado_documento,
    categoria,
    page = 1,
    limit = 10,
  } = filters;

  const ci = normalizeCiRif(ci_rif);
  if (!ci) {
    return { rows: [], total: 0, page: 1, limit, totalPages: 0 };
  }

  const where = ["p.ci_rif ILIKE $1"];
  const values = [`%${ci}%`];
  let paramIndex = 2;

  if (tipo_persona) {
    where.push(`p.tipo_persona = $${paramIndex}`);
    values.push(String(tipo_persona));
    paramIndex++;
  }

  if (estado_documento) {
    where.push(
      `EXISTS (
         SELECT 1 FROM licencias l
         JOIN documentos_emitidos de ON l.id_documento = de.id_documento
         WHERE l.id_persona = p.id_persona AND de.estado_documento = $${paramIndex}
         UNION ALL
         SELECT 1 FROM autorizaciones_especiales ae
         JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
         WHERE ae.id_persona = p.id_persona AND de.estado_documento = $${paramIndex}
         UNION ALL
         SELECT 1 FROM participaciones pa
         JOIN documentos_emitidos de ON pa.id_documento = de.id_documento
         WHERE pa.id_persona = p.id_persona AND de.estado_documento = $${paramIndex}
       )`,
    );
    values.push(String(estado_documento));
    paramIndex++;
  }

  if (categoria) {
    where.push(
      `EXISTS (
         SELECT 1 FROM licencias l
         WHERE l.id_persona = p.id_persona AND l.categoria = $${paramIndex}
       )`,
    );
    values.push(String(categoria));
    paramIndex++;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const dataQuery = `
    WITH resultados_filtrados AS (
      SELECT p.id_persona, p.ci_rif, p.razon_social, p.tipo_persona,
             p.direccion_fiscal, p.telefono, p.email
        FROM personas p
       WHERE ${where.join(" AND ")}
    ),
    total AS (
      SELECT COUNT(*)::int AS total FROM resultados_filtrados
    ),
    pagina AS (
      SELECT * FROM resultados_filtrados
      ORDER BY razon_social ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    )
    SELECT
      p.id_persona, p.ci_rif, p.razon_social, p.tipo_persona,
      p.direccion_fiscal, p.telefono, p.email,
      (SELECT de.numero_documento
         FROM licencias l
         JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE l.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1) AS nro_licencia,
      (SELECT de.numero_documento
         FROM autorizaciones_especiales ae
         JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
        WHERE ae.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1) AS nro_autorizacion,
      (SELECT de.numero_documento
         FROM participaciones pa
         JOIN documentos_emitidos de ON pa.id_documento = de.id_documento
        WHERE pa.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1) AS nro_participacion,
      ARRAY_REMOVE(ARRAY[
        (CASE WHEN EXISTS (SELECT 1 FROM solicitudes s WHERE s.id_persona = p.id_persona) THEN 'Solicitud' ELSE NULL END),
        (CASE WHEN EXISTS (SELECT 1 FROM licencias l WHERE l.id_persona = p.id_persona) THEN 'Licencia' ELSE NULL END),
        (CASE WHEN EXISTS (SELECT 1 FROM participaciones pa WHERE pa.id_persona = p.id_persona) THEN 'Participación' ELSE NULL END),
        (CASE WHEN EXISTS (SELECT 1 FROM autorizaciones_especiales ae WHERE ae.id_persona = p.id_persona) THEN 'Autorización Especial' ELSE NULL END)
      ], NULL) AS documentos,
      t.total AS total_count
    FROM pagina p CROSS JOIN total t
    ORDER BY p.razon_social ASC
  `;

  values.push(limitNum, offset);
  const result = await pool.query(dataQuery, values);
  const total = result.rows[0]?.total_count || 0;

  return {
    rows: result.rows,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const get_representantes_persona = async (id_persona) => {
  if (!isUuid(id_persona)) return [];
  const query = `
    SELECT
      c.id_comercializadores AS id_comercializador,
      c.razon_social          AS comercializador,
      c.rif,
      cr.cargo,
      cr.estado
    FROM comercializadores_representantes cr
    JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
    WHERE cr.id_persona = $1
    ORDER BY c.razon_social ASC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const get_centros_apuesta_persona = async (id_persona) => {
  if (!isUuid(id_persona)) return [];
  const query = `
    SELECT
      ca.id_centro,
      ca.nombre_agencia,
      ca.direccion,
      ca.estado,
      ca.id_comercializador,
      com.razon_social AS comercializador
    FROM centros_apuesta ca
    JOIN comercializadores com ON ca.id_comercializador = com.id_comercializadores
    WHERE ca.id_persona = $1
    ORDER BY ca.nombre_agencia ASC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const get_detalle_persona = async (id_persona) => {
  if (!isUuid(id_persona)) return null;

  const personaRes = await pool.query(
    `SELECT id_persona, ci_rif, razon_social, tipo_persona, direccion_fiscal, telefono, email
       FROM personas
      WHERE id_persona = $1`,
    [id_persona],
  );

  if (!personaRes.rows[0]) return null;

  const licenciasRes = await pool.query(
    `SELECT
       l.id_documento,
       l.id_comercializador,
       l.id_centro,
       l.categoria,
       l.numero_lot,
       de.numero_documento,
       de.papel_seguridad,
       de.tipo_emision,
       de.estado_documento,
       de.fecha_expedicion,
       de.fecha_vencimiento,
       de.direccion_establecimiento,
       c.razon_social  AS comercializador,
       u.nombre_usuario AS emitido_por
     FROM licencias AS l
     JOIN documentos_emitidos AS de ON l.id_documento  = de.id_documento
     JOIN usuarios             AS u  ON de.emitido_por = u.id_usuario
     LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
     WHERE l.id_persona = $1
     ORDER BY de.fecha_expedicion DESC`,
    [id_persona],
  );

  const solicitudesRes = await pool.query(
    `SELECT
       s.id_solicitudes,
       s.tipo_tramite,
       s.categoria_licencia,
       s.estado,
       s.descripcion_tramite,
       s.created_at,
       s.id_comercializador,
       c.razon_social AS comercializador,
       u.nombre_usuario AS registrado_por
     FROM solicitudes AS s
     JOIN usuarios AS u ON s.registrado_por = u.id_usuario
     LEFT JOIN comercializadores AS c ON s.id_comercializador = c.id_comercializadores
     WHERE s.id_persona = $1
     ORDER BY s.created_at DESC`,
    [id_persona],
  );

  const participacionesRes = await pool.query(
    `SELECT
       p.id_documento,
       de.numero_documento,
       de.estado_documento,
       de.fecha_expedicion,
       de.fecha_vencimiento,
       p.tipo,
       p.nro_archivo,
       p.id_comercializador,
       c.razon_social AS comercializador
     FROM participaciones AS p
     JOIN documentos_emitidos AS de ON p.id_documento = de.id_documento
     LEFT JOIN comercializadores AS c ON p.id_comercializador = c.id_comercializadores
     WHERE p.id_persona = $1
     ORDER BY de.fecha_expedicion DESC`,
    [id_persona],
  );

  const representantesRes = await pool.query(
    `SELECT
       cr.id_c_representantes,
       c.id_comercializadores AS id_comercializador,
       c.razon_social          AS comercializador,
       c.rif,
       cr.cargo,
       cr.estado
     FROM comercializadores_representantes cr
     JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
     WHERE cr.id_persona = $1
     ORDER BY c.razon_social ASC`,
    [id_persona],
  );

  const centrosRes = await pool.query(
    `SELECT
       ca.id_centro,
       ca.id_comercializador,
       ca.nombre_agencia,
       ca.direccion,
       ca.estado,
       com.razon_social AS comercializador
     FROM centros_apuesta ca
     JOIN comercializadores com ON ca.id_comercializador = com.id_comercializadores
     WHERE ca.id_persona = $1
     ORDER BY ca.nombre_agencia ASC`,
    [id_persona],
  );

  return {
    persona: personaRes.rows[0],
    licencias: licenciasRes.rows,
    solicitudes: solicitudesRes.rows,
    participaciones: participacionesRes.rows,
    representantes: representantesRes.rows,
    centros_apuesta: centrosRes.rows,
  };
};
