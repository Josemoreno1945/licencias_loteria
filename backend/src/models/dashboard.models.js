import { pool } from "../db.js";

export const get_dashboard_resumen = async () => {
  const query = `
  SELECT
    (SELECT COUNT(*) FROM personas) AS total_personas,
    (SELECT COUNT(*) FROM personas WHERE tipo_persona = 'natural') AS personas_naturales,
    (SELECT COUNT(*) FROM personas WHERE tipo_persona = 'juridica') AS personas_juridicas,
    (SELECT COUNT(*) FROM operadoras) AS total_operadoras,
    (SELECT COUNT(*) FROM bancos) AS total_bancos,
    (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
    (SELECT COUNT(*) FROM licencias) AS total_licencias,
    (SELECT COUNT(*) FROM licencias l JOIN documentos_emitidos de ON l.id_documento = de.id_documento WHERE de.estado_documento = 'vigente') AS licencias_vigentes,
    (SELECT COUNT(*) FROM participaciones) AS total_participaciones,
    (SELECT COUNT(*) FROM autorizaciones_especiales) AS total_autorizaciones,
    (SELECT COUNT(*) FROM solicitudes WHERE estado = 'Pendiente') AS solicitudes_pendientes,
    (SELECT COUNT(*) FROM centros_apuesta WHERE estado = 'activo') AS centros_activos,
    (SELECT COALESCE(SUM(monto), 0) FROM pagos) AS total_recaudado
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

export const get_dashboard_proximos_vencer = async () => {
  const query = `
  (
    SELECT
      'licencia' AS tipo,
      de.numero_documento,
      de.fecha_vencimiento,
      p.razon_social AS persona,
      de.created_at
    FROM licencias l
    JOIN documentos_emitidos de ON l.id_documento = de.id_documento
    JOIN personas p ON l.id_persona = p.id_persona
    WHERE de.estado_documento = 'vigente'
      AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  )
  UNION ALL
  (
    SELECT
      'autorizacion' AS tipo,
      de.numero_documento,
      de.fecha_vencimiento,
      p.razon_social AS persona,
      de.created_at
    FROM autorizaciones_especiales ae
    JOIN documentos_emitidos de ON ae.id_documento = de.id_documento
    JOIN personas p ON ae.id_persona = p.id_persona
    WHERE de.estado_documento = 'vigente'
      AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  )
  UNION ALL
  (
    SELECT
      'participacion' AS tipo,
      de.numero_documento,
      de.fecha_vencimiento,
      p.razon_social AS persona,
      de.created_at
    FROM participaciones par
    JOIN documentos_emitidos de ON par.id_documento = de.id_documento
    JOIN personas p ON par.id_persona = p.id_persona
    WHERE de.estado_documento = 'vigente'
      AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  )
  ORDER BY fecha_vencimiento ASC
  LIMIT 10
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const get_dashboard_licencias_por_categoria = async () => {
  const query = `
  SELECT
    l.categoria,
    COUNT(*) AS cantidad
  FROM licencias l
  JOIN documentos_emitidos de ON l.id_documento = de.id_documento
  WHERE de.estado_documento = 'vigente'
  GROUP BY l.categoria
  ORDER BY cantidad DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};
