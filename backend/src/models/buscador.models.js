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
       de.fecha_emision,
       de.fecha_entrega,
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

  return {
    persona: personaRes.rows[0],
    licencias: licenciasRes.rows,
    solicitudes: solicitudesRes.rows,
    // participaciones: participacionesRes.rows,     // TODO: activar cuando esté listo
    // autorizaciones_especiales: autorizacionesRes.rows, // TODO: activar cuando esté listo
  };
};
