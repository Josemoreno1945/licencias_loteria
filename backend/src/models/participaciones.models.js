import { pool } from "../db.js";

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
    par.tipo,
    par.numero_lot,
    par.nro_archivo,
    par.id_licencia,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    u.nombre_usuario    AS emitido_por,
    de.created_at,
    de.updated_at
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento       = de.id_documento
  JOIN personas            AS p  ON par.id_persona         = p.id_persona
  JOIN usuarios            AS u  ON de.emitido_por       = u.id_usuario
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
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
    de.direccion_establecimiento,
    de.observaciones          AS observaciones_documento,
    de.detalles_extra,
    par.tipo,
    par.numero_lot,
    par.nro_archivo,
    par.id_licencia,
    de_lic.numero_documento AS licencia_numero,
    par.id_centro,
    p.ci_rif,
    p.razon_social      AS persona,
    p.tipo_persona,
    c.razon_social      AS comercializador,
    ca.nombre_agencia    AS centro_apuesta,
    ca.direccion         AS centro_apuesta_direccion,
    p_ca.ci_rif          AS centro_apuesta_representante_ci,
    p_ca.razon_social    AS centro_apuesta_representante,
    de.id_solicitud,
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
    (SELECT COALESCE(json_agg(json_build_object('id_persona', rp.id_persona, 'ci_rif', rpp.ci_rif, 'razon_social', rpp.razon_social, 'cargo', rp.cargo, 'rol', rp.rol)) FILTER (WHERE rpp.id_persona IS NOT NULL), '[]'::json)
     FROM participaciones_representantes rp
     LEFT JOIN personas rpp ON rp.id_persona = rpp.id_persona
     WHERE rp.id_documento = par.id_documento) AS representantes
  FROM participaciones AS par
  JOIN documentos_emitidos AS de  ON par.id_documento       = de.id_documento
  JOIN personas            AS p   ON par.id_persona         = p.id_persona
  JOIN usuarios            AS u   ON de.emitido_por       = u.id_usuario
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta AS ca ON par.id_centro = ca.id_centro
  LEFT JOIN personas        AS p_ca ON ca.id_persona = p_ca.id_persona
  LEFT JOIN documentos_emitidos AS de_lic ON par.id_licencia = de_lic.id_documento
  LEFT JOIN pagos AS pag ON pag.id_participacion = par.id_documento
  LEFT JOIN bancos AS b ON pag.id_banco = b.id_banco
  WHERE par.id_documento = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_participaciones_vigentes = async () => {
  const query = `
  SELECT
    par.id_documento,
    par.id_persona,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.tipo,
    par.nro_archivo,
    par.id_licencia,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot,
    par.id_centro
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento       = de.id_documento
  JOIN personas            AS p  ON par.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_participacion = async (data) => {
  const query = `
    INSERT INTO participaciones (id_documento, tipo, id_persona, id_comercializador, id_centro, id_licencia, numero_lot, nro_archivo)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
  const values = [
    data.id_documento,
    data.tipo,
    data.id_persona,
    data.id_comercializador ?? null,
    data.id_centro ?? null,
    data.id_licencia ?? null,
    data.numero_lot ?? null,
    data.nro_archivo ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_participacion_id = async (id, data) => {
  const allowed = [
    "tipo",
    "id_persona",
    "id_comercializador",
    "id_centro",
    "id_licencia",
    "numero_lot",
    "nro_archivo",
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
    par.tipo,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento       = de.id_documento
  JOIN personas            AS p  ON par.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
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
    par.tipo,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento       = de.id_documento
  JOIN personas            AS p  ON par.id_persona         = p.id_persona
  JOIN comercializadores   AS c  ON par.id_comercializador = c.id_comercializadores
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
    par.tipo,
    par.nro_archivo,
    de_lic.numero_documento AS licencia_numero,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento = de.id_documento
  JOIN personas            AS p  ON par.id_persona   = p.id_persona
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
  LEFT JOIN documentos_emitidos AS de_lic ON par.id_licencia = de_lic.id_documento
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
    par.tipo,
    par.nro_archivo,
    par.id_licencia,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento = de.id_documento
  JOIN personas            AS p  ON par.id_persona   = p.id_persona
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
  WHERE par.nro_archivo ILIKE $1
  `;
  const result = await pool.query(query, [`%${nro_archivo}%`]);
  return result.rows;
};

export const buscar_participaciones_por_numero_lot = async (numero_lot) => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    par.tipo,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento = de.id_documento
  JOIN personas            AS p  ON par.id_persona   = p.id_persona
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
  WHERE par.numero_lot ILIKE $1
  `;
  const result = await pool.query(query, [`%${numero_lot}%`]);
  return result.rows;
};

export const buscar_participaciones_proximas_a_vencer = async () => {
  const query = `
  SELECT
    par.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_vencimiento,
    par.tipo,
    par.nro_archivo,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    par.numero_lot
  FROM participaciones AS par
  JOIN documentos_emitidos AS de ON par.id_documento       = de.id_documento
  JOIN personas            AS p  ON par.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON par.id_comercializador = c.id_comercializadores
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
