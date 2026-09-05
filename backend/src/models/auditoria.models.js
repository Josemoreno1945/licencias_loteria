import { pool } from "../db.js";

/* ============================================================
   AUDITORÍA — Modelo de datos

   Resumen ejecutivo: totales globales del sistema (usuarios,
   personas, solicitudes, pagos, licencias, autorizaciones y
   participaciones).

   Registro de actividades: union de los eventos "registrables"
   a partir de las tablas existentes. SOLO se incluyen tablas
   que cuentan con un campo `registrado_por` (solicitudes y
   pagos) o con `created_at`/`updated_at` claramente
   identificables como fecha de alta / modificación.

   Para mantener el historial sin necesidad de una tabla nueva
   de logs, se construye una vista lógica vía UNION ALL.
   ============================================================ */

/**
 * Resumen de métricas globales del sistema para el Dashboard
 * de Auditoría.
 *  - total_usuarios / usuarios_activos
 *  - total_personas
 *  - total_solicitudes / solicitudes_hoy / solicitudes_mes
 *  - total_pagos    / pagos_hoy    / pagos_mes
 *  - total_licencias / total_autorizaciones / total_participaciones
 *  - top_usuarios_registrados (los 5 que más han registrado)
 */
export const get_auditoria_resumen = async () => {
  const query = `
    SELECT
      -- Usuarios
      (SELECT COUNT(*) FROM usuarios)                                              AS total_usuarios,
      (SELECT COUNT(*) FROM usuarios WHERE estado = 'activo')                      AS usuarios_activos,
      (SELECT COUNT(*) FROM usuarios WHERE estado = 'inactivo')                    AS usuarios_inactivos,

      -- Personas registradas
      (SELECT COUNT(*) FROM personas)                                              AS total_personas,
      (SELECT COUNT(*) FROM personas WHERE created_at::date = CURRENT_DATE)        AS personas_hoy,
      (SELECT COUNT(*) FROM personas WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS personas_mes,

      -- Solicitudes (quien registra = registrado_por)
      (SELECT COUNT(*) FROM solicitudes)                                           AS total_solicitudes,
      (SELECT COUNT(*) FROM solicitudes WHERE created_at::date = CURRENT_DATE)     AS solicitudes_hoy,
      (SELECT COUNT(*) FROM solicitudes WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS solicitudes_mes,

      -- Pagos
      (SELECT COUNT(*) FROM pagos)                                                 AS total_pagos,
      (SELECT COUNT(*) FROM pagos WHERE created_at::date = CURRENT_DATE)           AS pagos_hoy,
      (SELECT COUNT(*) FROM pagos WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS pagos_mes,
      (SELECT COALESCE(SUM(monto), 0)::float FROM pagos
        WHERE created_at >= date_trunc('month', CURRENT_DATE))                     AS recaudacion_mes,

      -- Documentos emitidos
      (SELECT COUNT(*) FROM licencias)                                             AS total_licencias,
      (SELECT COUNT(*) FROM autorizaciones_especiales)                             AS total_autorizaciones,
      (SELECT COUNT(*) FROM participaciones)                                       AS total_participaciones
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Top 5 de usuarios con mayor actividad de registro
 * (medido sobre `solicitudes` y `pagos`, las únicas tablas
 * que guardan `registrado_por`).
 */
export const get_auditoria_top_usuarios = async () => {
  const query = `
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.rol,
      COUNT(*)::int AS total_acciones
    FROM (
      SELECT registrado_por FROM solicitudes
      UNION ALL
      SELECT registrado_por FROM pagos
    ) AS acciones
    JOIN usuarios u ON u.id_usuario = acciones.registrado_por
    GROUP BY u.id_usuario, u.nombre_usuario, u.rol
    ORDER BY total_acciones DESC
    LIMIT 5
  `;
  const result = await pool.query(query);
  return result.rows;
};

/**
 * Registro de actividades (Activity Log).
 * Une los eventos registrables de las tablas clave del sistema.
 *  - Solicitudes (CREATE)
 *  - Pagos        (CREATE)
 *  - Personas     (CREATE / UPDATE por created_at / updated_at)
 *  - Usuarios     (CREATE / UPDATE por created_at / updated_at)
 *
 * Devuelve las últimas `limit` acciones ordenadas desc.
 *
 * Columnas retornadas:
 *   id              → UUID del registro afectado
 *   modulo          → nombre del módulo (Solicitudes, Pagos, ...)
 *   accion          → 'Registro' | 'Actualización'
 *   descripcion     → texto legible: "Registró una solicitud tipo Licencia"
 *   usuario_id      → UUID del usuario (puede ser NULL si la tabla no lo registra)
 *   usuario         → nombre_usuario (o 'Sistema' si NULL)
 *   rol             → rol del usuario (o NULL)
 *   referencia      → dato relevante (número, ci/rif, etc.)
 *   fecha           → timestamp del evento
 */
export const get_auditoria_actividades = async (limit = 100) => {
  const safeLimit = Math.max(1, Math.min(parseInt(limit, 10) || 100, 500));
  const query = `
    /* Solicitudes: registran QUIÉN la creó */
    (
      SELECT
        s.id_solicitudes::text        AS id,
        'Solicitudes'                 AS modulo,
        'Registro'                    AS accion,
        'Registró una solicitud tipo ' || s.tipo_tramite
                                       AS descripcion,
        s.registrado_por              AS usuario_id,
        u.nombre_usuario              AS usuario,
        u.rol                         AS rol,
        COALESCE(s.numero_licencia_loteriatachira, s.numero_autorizacion_conalot, s.id_solicitudes::text)
                                       AS referencia,
        s.created_at                  AS fecha
      FROM solicitudes s
      LEFT JOIN usuarios u ON u.id_usuario = s.registrado_por
    )
    UNION ALL
    /* Pagos: registran QUIÉN lo creó */
    (
      SELECT
        p.id_pago::text               AS id,
        'Pagos'                       AS modulo,
        'Registro'                    AS accion,
        'Registró un pago por Bs. ' || p.monto::text
                                       AS descripcion,
        p.registrado_por              AS usuario_id,
        u.nombre_usuario              AS usuario,
        u.rol                         AS rol,
        p.num_referencia              AS referencia,
        p.created_at                  AS fecha
      FROM pagos p
      LEFT JOIN usuarios u ON u.id_usuario = p.registrado_por
    )
    UNION ALL
    /* Personas: alta */
    (
      SELECT
        pe.id_persona::text           AS id,
        'Personas'                    AS modulo,
        'Registro'                    AS accion,
        'Registró la persona ' || pe.razon_social
                                       AS descripcion,
        NULL::uuid                    AS usuario_id,
        'Sistema'                     AS usuario,
        NULL::varchar                 AS rol,
        pe.ci_rif                     AS referencia,
        pe.created_at                 AS fecha
      FROM personas pe
    )
    UNION ALL
    /* Personas: actualización (si updated_at > created_at) */
    (
      SELECT
        pe.id_persona::text           AS id,
        'Personas'                    AS modulo,
        'Actualización'               AS accion,
        'Actualizó los datos de ' || pe.razon_social
                                       AS descripcion,
        NULL::uuid                    AS usuario_id,
        'Sistema'                     AS usuario,
        NULL::varchar                 AS rol,
        pe.ci_rif                     AS referencia,
        pe.updated_at                 AS fecha
      FROM personas pe
      WHERE pe.updated_at > pe.created_at
    )
    UNION ALL
    /* Usuarios: alta */
    (
      SELECT
        us.id_usuario::text           AS id,
        'Usuarios'                    AS modulo,
        'Registro'                    AS accion,
        'Registró al usuario ' || us.nombre_usuario || ' (' || us.rol || ')'
                                       AS descripcion,
        NULL::uuid                    AS usuario_id,
        'Sistema'                     AS usuario,
        NULL::varchar                 AS rol,
        us.email                      AS referencia,
        us.created_at                 AS fecha
      FROM usuarios us
    )
    UNION ALL
    /* Usuarios: actualización (si updated_at > created_at) */
    (
      SELECT
        us.id_usuario::text           AS id,
        'Usuarios'                    AS modulo,
        'Actualización'               AS accion,
        'Actualizó al usuario ' || us.nombre_usuario
                                       AS descripcion,
        NULL::uuid                    AS usuario_id,
        'Sistema'                     AS usuario,
        NULL::varchar                 AS rol,
        us.email                      AS referencia,
        us.updated_at                 AS fecha
      FROM usuarios us
      WHERE us.updated_at > us.created_at
    )
    ORDER BY fecha DESC
    LIMIT ${safeLimit}
  `;
  const result = await pool.query(query);
  return result.rows;
};
