import { pool } from "../db.js";

/* ============================================================
   DASHBOARD — Modelo de datos
   Todas las queries usan índices ya creados en bdd.sql
   (idx_doc_vencimiento_estado, idx_licencias_categoria,
    idx_solicitudes_estado, idx_pagos_fecha).
   ============================================================ */

/**
 * Resumen ejecutivo: SOLO métricas de los productos principales.
 * Se eliminan total_usuarios, total_bancos y total_personas del resumen
 * ejecutivo (no aportan al flujo del área).
 */
export const get_dashboard_resumen = async () => {
  const query = `
    SELECT
      -- Solicitudes
      (SELECT COUNT(*) FROM solicitudes)                                                   AS solicitudes_total,
      (SELECT COUNT(*) FROM solicitudes WHERE estado = 'Pendiente')                        AS solicitudes_pendientes,
      (SELECT COUNT(*) FROM solicitudes WHERE estado = 'Aprobado')                         AS solicitudes_aprobadas,
      (SELECT COUNT(*) FROM solicitudes WHERE estado = 'Rechazada')                        AS solicitudes_rechazadas,

      -- Licencias
      (SELECT COUNT(*) FROM licencias)                                                     AS licencias_total,
      (SELECT COUNT(*) FROM licencias l
        JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE de.estado_documento = 'vigente')                                             AS licencias_vigentes,
      (SELECT COUNT(*) FROM licencias l
        JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE de.estado_documento = 'vencido')                                             AS licencias_vencidas,
      (SELECT COUNT(*) FROM licencias l
        JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE de.estado_documento = 'anulado')                                             AS licencias_anuladas,
      (SELECT COUNT(*) FROM licencias l
        JOIN documentos_emitidos de ON l.id_documento = de.id_documento
        WHERE de.estado_documento = 'suspendido')                                          AS licencias_suspendidas,

      -- Participaciones
      (SELECT COUNT(*) FROM participaciones)                                               AS participaciones_total,
      (SELECT COUNT(*) FROM participaciones par
        JOIN documentos_emitidos de ON par.id_documento = de.id_documento
        WHERE de.estado_documento = 'vigente')                                             AS participaciones_vigentes,
      (SELECT COUNT(*) FROM participaciones par
        JOIN documentos_emitidos de ON par.id_documento = de.id_documento
        WHERE de.estado_documento = 'vencido')                                             AS participaciones_vencidas,
      (SELECT COUNT(*) FROM participaciones par
        JOIN documentos_emitidos de ON par.id_documento = de.id_documento
        WHERE de.estado_documento = 'anulado')                                             AS participaciones_anuladas,

      -- Autorizaciones Especiales
      (SELECT COUNT(*) FROM autorizaciones_especiales)                                     AS autorizaciones_total,
      (SELECT COUNT(*) FROM autorizaciones_especiales ae
        JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
        WHERE de.estado_documento = 'vigente')                                             AS autorizaciones_vigentes,
      (SELECT COUNT(*) FROM autorizaciones_especiales ae
        JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
        WHERE de.estado_documento = 'vencido')                                             AS autorizaciones_vencidas,
      (SELECT COUNT(*) FROM autorizaciones_especiales ae
        JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
        WHERE de.estado_documento = 'anulado')                                             AS autorizaciones_anuladas,

      -- Recaudación: solo pagos cuyo documento sigue vigente o vencido (no anulado)
      (SELECT COALESCE(SUM(p.monto), 0)::float
         FROM pagos p
         JOIN documentos_emitidos de ON de.id_documento IN (
           COALESCE(p.id_licencia, '00000000-0000-0000-0000-000000000000'::uuid),
           COALESCE(p.id_autorizacion, '00000000-0000-0000-0000-000000000000'::uuid),
           COALESCE(p.id_participacion, '00000000-0000-0000-0000-000000000000'::uuid)
         )
         WHERE de.estado_documento <> 'anulado'
      )                                                                                    AS total_recaudado
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

/* ------------------------------------------------------------
   Distribuciones / rankings para gráficos
   ------------------------------------------------------------ */

export const get_dashboard_licencias_por_categoria = async () => {
  const query = `
    SELECT l.categoria, COUNT(*)::int AS cantidad
    FROM licencias l
    JOIN documentos_emitidos de ON l.id_documento = de.id_documento
    WHERE de.estado_documento = 'vigente'
    GROUP BY l.categoria
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_licencias_por_estado = async () => {
  const query = `
    SELECT de.estado_documento AS estado, COUNT(*)::int AS cantidad
    FROM licencias l
    JOIN documentos_emitidos de ON l.id_documento = de.id_documento
    GROUP BY de.estado_documento
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_licencias_por_tipo_emision = async () => {
  const query = `
    SELECT de.tipo_emision, COUNT(*)::int AS cantidad
    FROM licencias l
    JOIN documentos_emitidos de ON l.id_documento = de.id_documento
    GROUP BY de.tipo_emision
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_solicitudes_por_estado = async () => {
  const query = `
    SELECT estado, COUNT(*)::int AS cantidad
    FROM solicitudes
    GROUP BY estado
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_solicitudes_por_tipo_tramite = async () => {
  const query = `
    SELECT tipo_tramite, COUNT(*)::int AS cantidad
    FROM solicitudes
    GROUP BY tipo_tramite
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_participaciones_por_tipo = async () => {
  const query = `
    SELECT par.tipo_participacion, COUNT(*)::int AS cantidad
    FROM participaciones par
    JOIN documentos_emitidos de ON par.id_documento = de.id_documento
    GROUP BY par.tipo_participacion
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_participaciones_por_estado = async () => {
  const query = `
    SELECT de.estado_documento AS estado, COUNT(*)::int AS cantidad
    FROM participaciones par
    JOIN documentos_emitidos de ON par.id_documento = de.id_documento
    GROUP BY de.estado_documento
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_autorizaciones_por_tipo = async () => {
  const query = `
    SELECT ae.tipo_autorizacion_especial AS tipo, COUNT(*)::int AS cantidad
    FROM autorizaciones_especiales ae
    JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
    GROUP BY ae.tipo_autorizacion_especial
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_autorizaciones_por_estado = async () => {
  const query = `
    SELECT de.estado_documento AS estado, COUNT(*)::int AS cantidad
    FROM autorizaciones_especiales ae
    JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
    GROUP BY de.estado_documento
    ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

/* ------------------------------------------------------------
   Próximos a vencer (30 días) — unión de los 3 productos
   ------------------------------------------------------------ */
export const get_dashboard_proximos_vencer = async () => {
  const query = `
    (
      SELECT
        'licencia'::text          AS tipo,
        de.numero_documento       AS numero_documento,
        de.fecha_vencimiento      AS fecha_vencimiento,
        p.razon_social            AS persona
      FROM licencias l
      JOIN documentos_emitidos de ON l.id_documento = de.id_documento
      JOIN personas p             ON l.id_persona  = p.id_persona
      WHERE de.estado_documento = 'vigente'
        AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    )
    UNION ALL
    (
      SELECT
        'autorizacion'::text      AS tipo,
        de.numero_documento       AS numero_documento,
        de.fecha_vencimiento      AS fecha_vencimiento,
        p.razon_social            AS persona
      FROM autorizaciones_especiales ae
      JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
      JOIN personas p             ON ae.id_persona   = p.id_persona
      WHERE de.estado_documento = 'vigente'
        AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    )
    UNION ALL
    (
      SELECT
        'participacion'::text     AS tipo,
        de.numero_documento       AS numero_documento,
        de.fecha_vencimiento      AS fecha_vencimiento,
        p.razon_social            AS persona
      FROM participaciones par
      JOIN documentos_emitidos de ON par.id_documento = de.id_documento
      JOIN personas p             ON par.id_persona   = p.id_persona
      WHERE de.estado_documento = 'vigente'
        AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    )
    ORDER BY fecha_vencimiento ASC
    LIMIT 10
  `;
  const result = await pool.query(query);
  return result.rows;
};
