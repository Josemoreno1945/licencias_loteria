import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_solicitudes = async () => {
  const query = `
  SELECT
    s.id_solicitudes,
    p.ci_rif,
    p.razon_social      AS persona,
    s.id_comercializador,
    c.razon_social      AS comercializador,
    s.id_operadora,
    op.razon_social     AS operadora,
    s.tipo_tramite,
    s.categoria_licencia,
    s.tipo_participacion,
    s.tipo_autorizacion_especial,
    s.estado,
    s.descripcion_tramite,
    s.observaciones,
    s.justificacion_no_logrado,
    s.tipo_emision,
    s.numero_autorizacion_conalot,
    u.nombre_usuario    AS registrado_por,
    s.created_at,
    s.updated_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  JOIN usuarios       AS u  ON s.registrado_por      = u.id_usuario
  LEFT JOIN comercializadores  AS c   ON s.id_comercializador = c.id_comercializadores
  LEFT JOIN operadoras         AS op  ON s.id_operadora       = op.id_operadora
  ORDER BY s.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_solicitudes_id = async (id) => {
  const query = `
  SELECT
    s.id_solicitudes,
    s.id_persona,
    p.ci_rif,
    p.razon_social      AS persona,
    p.tipo_persona,
    s.id_comercializador,
    c.razon_social      AS comercializador,
    c.rif               AS comercializador_rif,
    c.direccion_fiscal  AS comercializador_direccion,
    c.telefono          AS comercializador_telefono,
    c.email             AS comercializador_email,
    -- Centro de apuesta (vía tabla puente solicitud_centros)
    sc_sub.id_centro,
    ca.nombre_agencia   AS centro_apuesta,
    ca.direccion        AS centro_apuesta_direccion,
    p_ca.razon_social   AS centro_apuesta_representante,
    p_ca.ci_rif         AS centro_apuesta_representante_ci,
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.observaciones,
    s.justificacion_no_logrado,
    s.tipo_emision,
    s.numero_autorizacion_conalot,
    s.fecha_emision_conalot,
    s.fecha_vencimiento_conalot,
    s.numero_licencia_loteriatachira,
    s.direccion_autorizacion_especial,
    s.tipo_participacion,
    s.tipo_autorizacion_especial,
    u.nombre_usuario    AS registrado_por,
    s.created_at,
    s.updated_at,
    -- Juegos seleccionados como array JSON
    COALESCE(
      (SELECT json_agg(json_build_object('id_juego', j.id_juego, 'nombre', j.nombre))
       FROM solicitud_juegos sj
       JOIN juegos j ON sj.id_juego = j.id_juego
       WHERE sj.id_solicitud = s.id_solicitudes),
      '[]'
    ) AS juegos
  FROM solicitudes AS s
  JOIN personas           AS p   ON s.id_persona         = p.id_persona
  JOIN usuarios           AS u   ON s.registrado_por      = u.id_usuario
  LEFT JOIN comercializadores AS c ON s.id_comercializador = c.id_comercializadores
  -- Primer centro vinculado (si existe)
  LEFT JOIN LATERAL (
    SELECT id_centro FROM solicitud_centros
    WHERE id_solicitud = s.id_solicitudes
    LIMIT 1
  ) sc_sub ON true
  LEFT JOIN centros_apuesta AS ca ON sc_sub.id_centro = ca.id_centro
  LEFT JOIN personas        AS p_ca ON ca.id_persona      = p_ca.id_persona
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
    s.tipo_emision,
    s.numero_autorizacion_conalot,
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

//post (transaccional: solicitud + juegos + centro)--------------------
export const crear_solicitud = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insertar la solicitud principal
    const solicitudQuery = `
      INSERT INTO solicitudes (
        id_persona, id_comercializador, id_operadora,
        tipo_tramite, categoria_licencia, tipo_participacion, tipo_autorizacion_especial, estado,
        descripcion_tramite, observaciones, justificacion_no_logrado,
        tipo_emision, numero_autorizacion_conalot,
        fecha_emision_conalot, fecha_vencimiento_conalot,
        numero_licencia_loteriatachira, direccion_autorizacion_especial,
        registrado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`;
    const solicitudValues = [
      data.id_persona,
      data.id_comercializador ?? null,
      data.id_operadora ?? null,
      data.tipo_tramite,
      data.categoria_licencia ?? null,
      data.tipo_participacion ?? null,
      data.tipo_autorizacion_especial ?? null,
      data.estado ?? "Pendiente",
      data.descripcion_tramite ?? null,
      data.observaciones ?? null,
      data.justificacion_no_logrado ?? null,
      data.tipo_emision ?? null,
      data.numero_autorizacion_conalot ?? null,
      data.fecha_emision_conalot ?? null,
      data.fecha_vencimiento_conalot ?? null,
      data.numero_licencia_loteriatachira ?? null,
      data.direccion_autorizacion_especial ?? null,
      data.registrado_por,
    ];
    const solicitudResult = await client.query(solicitudQuery, solicitudValues);
    const nuevaSolicitud = solicitudResult.rows[0];
    const id_solicitudes = nuevaSolicitud.id_solicitudes;

    // 2. Insertar los juegos seleccionados (solicitud_juegos)
    if (data.id_juegos && data.id_juegos.length > 0) {
      for (const id_juego of data.id_juegos) {
        await client.query(
          `INSERT INTO solicitud_juegos (id_solicitud, id_juego) VALUES ($1, $2)
           ON CONFLICT (id_solicitud, id_juego) DO NOTHING`,
          [id_solicitudes, id_juego]
        );
      }
    }

    // 3. Insertar el centro de apuesta vinculado (solicitud_centros)
    if (data.id_centro) {
      await client.query(
        `INSERT INTO solicitud_centros (id_solicitud, id_centro) VALUES ($1, $2)
         ON CONFLICT (id_solicitud, id_centro) DO NOTHING`,
        [id_solicitudes, data.id_centro]
      );
    }

    await client.query("COMMIT");
    return solicitudResult.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

//put---------------------------------------------------
export const actualizar_solicitud_id = async (id, data) => {
  const query = `
    UPDATE solicitudes
    SET
      id_persona                  = $1,
      id_comercializador          = $2,
      id_operadora                = $3,
      tipo_tramite                = $4,
      categoria_licencia          = $5,
      tipo_participacion          = $6,
      tipo_autorizacion_especial  = $7,
      estado                      = $8,
      descripcion_tramite         = $9,
      observaciones               = $10,
      justificacion_no_logrado    = $11,
      tipo_emision                = $12,
      numero_autorizacion_conalot = $13,
      fecha_emision_conalot       = $14,
      fecha_vencimiento_conalot   = $15,
      numero_licencia_loteriatachira = $16,
      direccion_autorizacion_especial = $17
    WHERE id_solicitudes = $18 RETURNING *`;
  const values = [
    data.id_persona,
    data.id_comercializador ?? null,
    data.id_operadora ?? null,
    data.tipo_tramite,
    data.categoria_licencia ?? null,
    data.tipo_participacion ?? null,
    data.tipo_autorizacion_especial ?? null,
    data.estado,
    data.descripcion_tramite ?? null,
    data.observaciones ?? null,
    data.justificacion_no_logrado ?? null,
    data.tipo_emision ?? null,
    data.numero_autorizacion_conalot ?? null,
    data.fecha_emision_conalot ?? null,
    data.fecha_vencimiento_conalot ?? null,
    data.numero_licencia_loteriatachira ?? null,
    data.direccion_autorizacion_especial ?? null,
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
    s.id_comercializador,
    c.razon_social      AS comercializador,
    s.id_operadora,
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
