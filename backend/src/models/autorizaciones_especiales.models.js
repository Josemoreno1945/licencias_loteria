import { pool } from "../db.js";

const REPRESENTANTES_SUBQUERY = `(
  SELECT COALESCE(json_agg(json_build_object(
    'id_persona', ar.id_persona,
    'ci_rif', arp.ci_rif,
    'razon_social', arp.razon_social,
    'cargo', ar.cargo,
    'rol', ar.rol
  )) FILTER (WHERE arp.id_persona IS NOT NULL), '[]'::json)
  FROM autorizaciones_representantes ar
  LEFT JOIN personas arp ON ar.id_persona = arp.id_persona
  WHERE ar.id_documento = ae.id_documento
)`;

//get--------------------------------------------------------------------
export const get_autorizaciones_especiales = async () => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto,
    u.nombre_usuario    AS emitido_por,
    de.created_at,
    de.updated_at
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN usuarios            AS u  ON de.emitido_por   = u.id_usuario
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  LEFT JOIN comercializadores AS c ON ae.id_comercializador = c.id_comercializadores
  ORDER BY de.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_autorizaciones_especiales_id = async (id) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.observaciones            AS observaciones_documento,
    de.detalles_extra,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    ae.direccion_centro_asignado,
    ae.direccion_localidad,
    ae.direccion_responsable,
    ae.otros,
    p.ci_rif,
    p.razon_social      AS persona,
    p.tipo_persona      AS tipo_persona,
    c.razon_social      AS comercializador,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto,
    de.direccion_establecimiento,
    u.nombre_usuario    AS emitido_por,
    de.created_at,
    de.updated_at,
    pag.id_pago,
    pag.num_referencia  AS pago_numero_referencia,
    pag.fecha_pago      AS pago_fecha_pago,
    pag.monto           AS pago_monto,
    pag.tasa_dia        AS pago_tasa_dia,
    pag.responsable_texto AS pago_responsable,
    pag.observaciones   AS pago_observaciones,
    b.nombre            AS pago_banco,
    ${REPRESENTANTES_SUBQUERY} AS representantes
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN usuarios            AS u  ON de.emitido_por   = u.id_usuario
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  LEFT JOIN comercializadores AS c ON ae.id_comercializador = c.id_comercializadores
  LEFT JOIN pagos        AS pag ON pag.id_autorizacion = ae.id_documento
  LEFT JOIN bancos       AS b   ON pag.id_banco = b.id_banco
  WHERE ae.id_documento = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_autorizaciones_especiales_vigentes = async () => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    p.ci_rif,
    p.razon_social      AS persona,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_autorizacion_especial = async (data) => {
  const query = `
    INSERT INTO autorizaciones_especiales (
      id_documento, nro_mesa, tipo, id_persona,
      id_comercializador, id_centro, agencia_texto, numero_lot,
      direccion_centro_asignado, direccion_localidad, direccion_responsable, otros
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`;
  const values = [
    data.id_documento,
    data.nro_mesa ?? null,
    data.tipo ?? "Mesa",
    data.id_persona,
    data.id_comercializador ?? null,
    data.id_centro ?? null,
    data.agencia_texto ?? null,
    data.numero_lot ?? null,
    data.direccion_centro_asignado ?? null,
    data.direccion_localidad ?? null,
    data.direccion_responsable ?? null,
    data.otros ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_autorizacion_especial_id = async (id, data) => {
  const allowed = [
    "nro_mesa", "tipo", "id_persona",
    "id_comercializador", "id_centro", "agencia_texto", "numero_lot",
    "direccion_centro_asignado", "direccion_localidad",
    "direccion_responsable", "otros",
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
      `UPDATE autorizaciones_especiales SET ${fields.join(", ")}
       WHERE id_documento = $${i} RETURNING *`,
      [...values, id],
    );
  }

  // Representantes legales (N:M): se reemplazan por completo
  if (data.representantes) {
    const reps = (Array.isArray(data.representantes) ? data.representantes : [])
      .map((r) => (r && r.id_persona ? r : { id_persona: r }))
      .filter((r) => r.id_persona);

    await pool.query(`DELETE FROM autorizaciones_representantes WHERE id_documento = $1`, [id]);

    for (const rep of reps) {
      await pool.query(
        `INSERT INTO autorizaciones_representantes (id_documento, id_persona, rol, cargo)
         VALUES ($1, $2, $3, $4)`,
        [id, rep.id_persona, rep.rol ?? null, rep.cargo ?? null],
      );
    }
  }

  return get_autorizaciones_especiales_id(id);
};

//busquedas avanzadas----------------------------------------------------

export const buscar_autorizaciones_por_persona = async (id_persona) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    p.ci_rif,
    p.razon_social      AS persona,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE ae.id_persona = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const buscar_autorizaciones_por_centro = async (id_centro) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    p.ci_rif,
    p.razon_social      AS persona,
    ca.nombre_agencia   AS centro_apuesta
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  JOIN centros_apuesta     AS ca ON ae.id_centro     = ca.id_centro
  WHERE ae.id_centro = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_centro]);
  return result.rows;
};

export const buscar_autorizaciones_por_nro_mesa = async (nro_mesa) => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    p.ci_rif,
    p.razon_social      AS persona,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE ae.nro_mesa = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [nro_mesa]);
  return result.rows;
};

export const buscar_autorizaciones_proximas_a_vencer = async () => {
  const query = `
  SELECT
    ae.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_vencimiento,
    ae.tipo,
    ae.nro_mesa,
    ae.numero_lot,
    p.ci_rif,
    p.razon_social      AS persona,
    ca.nombre_agencia   AS centro_apuesta,
    ae.agencia_texto
  FROM autorizaciones_especiales AS ae
  JOIN documentos_emitidos AS de ON ae.id_documento  = de.id_documento
  JOIN personas            AS p  ON ae.id_persona    = p.id_persona
  LEFT JOIN centros_apuesta AS ca ON ae.id_centro    = ca.id_centro
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
