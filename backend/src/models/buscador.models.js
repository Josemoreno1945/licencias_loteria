import { pool } from "../db.js";

// Busca personas por ci_rif (búsqueda parcial insensible a mayúsculas)
export const buscar_personas_por_ci_rif = async (ci_rif) => {
  const query = `
  SELECT
    p.id_persona,
    p.ci_rif,
    p.razon_social,
    p.tipo_persona,
    p.direccion_fiscal,
    p.telefono,
    p.email,
    (
      SELECT de.numero_documento
      FROM licencias l
      JOIN documentos_emitidos de ON l.id_documento = de.id_documento
      WHERE l.id_persona = p.id_persona
      ORDER BY de.fecha_expedicion DESC
      LIMIT 1
    ) AS nro_licencia,
    (
      SELECT de.numero_documento
      FROM autorizaciones_especiales ae
      JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
      WHERE ae.id_persona = p.id_persona
      ORDER BY de.fecha_expedicion DESC
      LIMIT 1
    ) AS nro_autorizacion,
    (
      SELECT de.numero_documento
      FROM participaciones pa
      JOIN documentos_emitidos de ON pa.id_documento = de.id_documento
      WHERE pa.id_persona = p.id_persona
      ORDER BY de.fecha_expedicion DESC
      LIMIT 1
    ) AS nro_participacion
  FROM personas p
  WHERE p.ci_rif ILIKE $1
  ORDER BY p.razon_social ASC
  `;
  const result = await pool.query(query, [`%${ci_rif}%`]);
  return result.rows;
};

// Busqueda avanzada con paginacion y filtros
export const buscar_personas_avanzado = async (filters) => {
  const {
    ci_rif,
    tipo_persona,
    estado_documento,
    categoria,
    page = 1,
    limit = 10,
  } = filters

  const where = ["p.ci_rif ILIKE $1"]
  const values = [`%${ci_rif}%`]
  let paramIndex = 2

  if (tipo_persona) {
    where.push(`p.tipo_persona = $${paramIndex}`)
    values.push(tipo_persona)
    paramIndex++
  }

  if (estado_documento) {
    where.push(`EXISTS (
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
    )`)
    values.push(estado_documento)
    paramIndex++
  }

  if (categoria) {
    where.push(`EXISTS (
      SELECT 1 FROM licencias l
      WHERE l.id_persona = p.id_persona AND l.categoria = $${paramIndex}
    )`)
    values.push(categoria)
    paramIndex++
  }

  const offset = (page - 1) * limit

  const dataQuery = `
    WITH resultados_filtrados AS (
      SELECT p.id_persona, p.ci_rif, p.razon_social, p.tipo_persona,
             p.direccion_fiscal, p.telefono, p.email
      FROM personas p
      WHERE ${where.join(" AND ")}
    ),
    total AS (
      SELECT COUNT(*) AS total FROM resultados_filtrados
    ),
    pagina AS (
      SELECT * FROM resultados_filtrados
      ORDER BY razon_social ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    )
    SELECT 
      p.id_persona, p.ci_rif, p.razon_social, p.tipo_persona,
      p.direccion_fiscal, p.telefono, p.email,
      (
        SELECT de.numero_documento
        FROM licencias l
        JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE l.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1
      ) AS nro_licencia,
      (
        SELECT de.numero_documento
        FROM autorizaciones_especiales ae
        JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
        WHERE ae.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1
      ) AS nro_autorizacion,
      (
        SELECT de.numero_documento
        FROM participaciones pa
        JOIN documentos_emitidos de ON pa.id_documento = de.id_documento
        WHERE pa.id_persona = p.id_persona
        ORDER BY de.fecha_expedicion DESC
        LIMIT 1
      ) AS nro_participacion,
      t.total AS total_count
    FROM pagina p, total t
    ORDER BY p.razon_social ASC
  `

  values.push(limit, offset)
  const result = await pool.query(dataQuery, values)
  const total = result.rows[0]?.total_count || 0

  return {
    rows: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// Representantes de comercializadores asociados a una persona
export const get_representantes_persona = async (id_persona) => {
  const query = `
    SELECT
      c.razon_social AS comercializador,
      c.rif,
      cr.cargo,
      cr.estado
    FROM comercializadores_representantes cr
    JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
    WHERE cr.id_persona = $1
    ORDER BY c.razon_social ASC
  `
  const result = await pool.query(query, [id_persona])
  return result.rows
}

// Centros de apuesta a cargo de una persona
export const get_centros_apuesta_persona = async (id_persona) => {
  const query = `
    SELECT
      ca.nombre_agencia,
      ca.direccion,
      ca.estado,
      com.razon_social AS comercializador
    FROM centros_apuesta ca
    JOIN comercializadores com ON ca.id_comercializador = com.id_comercializadores
    WHERE ca.id_persona = $1
    ORDER BY ca.nombre_agencia ASC
  `
  const result = await pool.query(query, [id_persona])
  return result.rows
}

// Devuelve el detalle completo de una persona: datos base + licencias + solicitudes
export const get_detalle_persona = async (id_persona) => {
  // Datos base de la persona
  const personaRes = await pool.query(
    `SELECT id_persona, ci_rif, razon_social, tipo_persona, direccion_fiscal, telefono, email
     FROM personas
     WHERE id_persona = $1`,
    [id_persona],
  );

  if (!personaRes.rows[0]) return null;

  // Licencias asociadas a la persona (con datos del documento emitido)
  const licenciasRes = await pool.query(
    `SELECT
       l.id_documento,
       de.numero_documento,
       de.papel_seguridad,
       de.tipo_emision,
       de.estado_documento,
       de.fecha_expedicion,
       de.fecha_vencimiento,
       de.direccion_establecimiento,
       l.categoria,
       l.numero_lot,
       c.razon_social  AS comercializador,
       u.nombre_usuario AS emitido_por
     FROM licencias AS l
     JOIN documentos_emitidos AS de ON l.id_documento     = de.id_documento
     JOIN usuarios             AS u  ON de.emitido_por    = u.id_usuario
     LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
     WHERE l.id_persona = $1
     ORDER BY de.fecha_expedicion DESC`,
    [id_persona],
  );

  // Solicitudes asociadas a la persona
  const solicitudesRes = await pool.query(
    `SELECT
       s.id_solicitudes,
       s.tipo_tramite,
       s.categoria_licencia,
       s.estado,
       s.descripcion_tramite,
       s.created_at,
       c.razon_social AS comercializador,
       u.nombre_usuario AS registrado_por
     FROM solicitudes AS s
     JOIN usuarios AS u ON s.registrado_por = u.id_usuario
     LEFT JOIN comercializadores AS c ON s.id_comercializador = c.id_comercializadores
     WHERE s.id_persona = $1
     ORDER BY s.created_at DESC`,
    [id_persona],
  );

  // ── Placeholder: Participaciones ─────────────────────────────────────────
  // TODO: descomentar cuando el módulo de participaciones esté listo
  // const participacionesRes = await pool.query(
  //   `SELECT
  //      p.id_documento,
  //      de.numero_documento,
  //      de.estado_documento,
  //      de.fecha_expedicion,
  //      de.fecha_vencimiento,
  //      p.nro_archivo,
  //      c.razon_social AS comercializador
  //    FROM participaciones AS p
  //    JOIN documentos_emitidos AS de ON p.id_documento = de.id_documento
  //    LEFT JOIN comercializadores AS c ON p.id_comercializador = c.id_comercializadores
  //    WHERE p.id_persona = $1
  //    ORDER BY de.fecha_expedicion DESC`,
  //   [id_persona],
  // );

  // ── Placeholder: Autorizaciones Especiales ────────────────────────────────
  // TODO: descomentar cuando el módulo de autorizaciones esté listo
  // const autorizacionesRes = await pool.query(
  //   `SELECT
  //      ae.id_documento,
  //      de.numero_documento,
  //      de.estado_documento,
  //      de.fecha_expedicion,
  //      de.fecha_vencimiento,
  //      ae.nro_mesa,
  //      op.razon_social AS operadora
  //    FROM autorizaciones_especiales AS ae
  //    JOIN documentos_emitidos AS de ON ae.id_documento = de.id_documento
  //    JOIN operadoras AS op ON ae.id_operadora = op.id_operadora
  //    WHERE ae.id_persona = $1
  //    ORDER BY de.fecha_expedicion DESC`,
  //   [id_persona],
  // );

  // Representantes de comercializadores asociados a la persona
  const representantesRes = await pool.query(
    `SELECT
       c.razon_social AS comercializador,
       c.rif,
       cr.cargo,
       cr.estado
     FROM comercializadores_representantes cr
     JOIN comercializadores c ON cr.id_comercializador = c.id_comercializadores
     WHERE cr.id_persona = $1
     ORDER BY c.razon_social ASC`,
    [id_persona],
  );

  // Centros de apuesta a cargo de la persona
  const centrosRes = await pool.query(
    `SELECT
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
    // participaciones: participacionesRes.rows,     // TODO: activar cuando esté listo
    // autorizaciones_especiales: autorizacionesRes.rows, // TODO: activar cuando esté listo
    representantes: representantesRes.rows,
    centros_apuesta: centrosRes.rows,
  };
};
