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
    s.updated_at,
    -- Todos los representantes activos de la comercializadora (JSON)
    COALESCE(
      (SELECT json_agg(
               json_build_object(
                 'id_persona',   rp.id_persona,
                 'ci_rif',       rp.ci_rif,
                 'razon_social', rp.razon_social,
                 'tipo_persona', rp.tipo_persona,
                 'cargo',        cr.cargo
               ) ORDER BY rp.razon_social
             )
       FROM comercializadores_representantes AS cr
       JOIN personas AS rp ON cr.id_persona = rp.id_persona
       WHERE cr.id_comercializador = c.id_comercializadores
         AND cr.estado = 'activo'),
      '[]'::json
    ) AS representantes
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  JOIN usuarios       AS u  ON s.registrado_por      = u.id_usuario
  LEFT JOIN comercializadores  AS c   ON s.id_comercializador = c.id_comercializadores
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
    ) AS juegos,
    -- Todos los centros de apuesta vinculados (JSON)
    COALESCE(
      (SELECT json_agg(
               json_build_object(
                 'id_centro',       ca.id_centro,
                 'nombre_agencia',  ca.nombre_agencia,
                 'direccion',       ca.direccion
               ) ORDER BY ca.nombre_agencia
             )
       FROM solicitud_centros sc
       JOIN centros_apuesta ca ON sc.id_centro = ca.id_centro
       WHERE sc.id_solicitud = s.id_solicitudes),
      '[]'::json
    ) AS centros,
    -- Todos los representantes activos de la comercializadora (JSON)
    COALESCE(
      (SELECT json_agg(
               json_build_object(
                 'id_persona',   rp.id_persona,
                 'ci_rif',       rp.ci_rif,
                 'razon_social', rp.razon_social,
                 'tipo_persona', rp.tipo_persona,
                 'cargo',        cr.cargo
               ) ORDER BY rp.razon_social
             )
       FROM comercializadores_representantes AS cr
       JOIN personas AS rp ON cr.id_persona = rp.id_persona
       WHERE cr.id_comercializador = c.id_comercializadores
         AND cr.estado = 'activo'),
      '[]'::json
    ) AS representantes
   FROM solicitudes AS s
   JOIN personas           AS p   ON s.id_persona         = p.id_persona
   JOIN usuarios           AS u   ON s.registrado_por      = u.id_usuario
   LEFT JOIN comercializadores AS c ON s.id_comercializador = c.id_comercializadores
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
        id_persona, id_comercializador,
        tipo_tramite, categoria_licencia, tipo_participacion, tipo_autorizacion_especial, estado,
        descripcion_tramite, observaciones, justificacion_no_logrado,
        tipo_emision, numero_autorizacion_conalot,
        fecha_emision_conalot, fecha_vencimiento_conalot,
        numero_licencia_loteriatachira, direccion_autorizacion_especial,
        registrado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`;
    const solicitudValues = [
      data.id_persona,
      data.id_comercializador ?? null,
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
          [id_solicitudes, id_juego],
        );
      }
    }

    // 3. Insertar el centro de apuesta vinculado (solicitud_centros)
    if (data.id_centro) {
      await client.query(
        `INSERT INTO solicitud_centros (id_solicitud, id_centro) VALUES ($1, $2)
         ON CONFLICT (id_solicitud, id_centro) DO NOTHING`,
        [id_solicitudes, data.id_centro],
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

export const actualizar_solicitud_id = async (id, data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const query = `
      UPDATE solicitudes
      SET
        id_persona                  = $1,
        id_comercializador          = $2,
        tipo_tramite                = $3,
        categoria_licencia          = $4,
        tipo_participacion          = $5,
        tipo_autorizacion_especial  = $6,
        estado                      = $7,
        descripcion_tramite         = $8,
        observaciones               = $9,
        justificacion_no_logrado    = $10,
        tipo_emision                = $11,
        numero_autorizacion_conalot = $12,
        fecha_emision_conalot       = $13,
        fecha_vencimiento_conalot   = $14,
        numero_licencia_loteriatachira = $15,
        direccion_autorizacion_especial = $16,
        updated_at                  = NOW()
      WHERE id_solicitudes = $17 RETURNING *`;
    const values = [
      data.id_persona,
      data.id_comercializador ?? null,
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
    const result = await client.query(query, values);

    await client.query(`DELETE FROM solicitud_juegos WHERE id_solicitud = $1`, [
      id,
    ]);
    if (data.id_juegos && data.id_juegos.length > 0) {
      for (const id_juego of data.id_juegos) {
        await client.query(
          `INSERT INTO solicitud_juegos (id_solicitud, id_juego) VALUES ($1, $2)
           ON CONFLICT (id_solicitud, id_juego) DO NOTHING`,
          [id, id_juego],
        );
      }
    }

    await client.query(
      `DELETE FROM solicitud_centros WHERE id_solicitud = $1`,
      [id],
    );
    if (data.id_centro) {
      await client.query(
        `INSERT INTO solicitud_centros (id_solicitud, id_centro) VALUES ($1, $2)
         ON CONFLICT (id_solicitud, id_centro) DO NOTHING`,
        [id, data.id_centro],
      );
    }

    await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
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
    s.tipo_tramite,
    s.categoria_licencia,
    s.estado,
    s.descripcion_tramite,
    s.created_at
  FROM solicitudes AS s
  JOIN personas       AS p  ON s.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c  ON s.id_comercializador = c.id_comercializadores
  WHERE s.estado = $1
  ORDER BY s.created_at DESC
  `;
  const result = await pool.query(query, [estado]);
  return result.rows;
};

export const buscar_solicitudes_por_comercializador = async (
  id_comercializador,
) => {
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
