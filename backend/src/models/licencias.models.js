import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_licencias = async () => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.direccion_establecimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    p.tipo_persona,
    c.razon_social      AS comercializador,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante,
    u.nombre_usuario    AS emitido_por,
    de.created_at,
    de.updated_at
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento       = de.id_documento
  JOIN personas            AS p  ON l.id_persona         = p.id_persona
  JOIN usuarios            AS u  ON de.emitido_por       = u.id_usuario
  LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
  ORDER BY de.created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_licencias_id = async (id) => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.papel_seguridad,
    de.tipo_emision,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    de.direccion_establecimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    p.tipo_persona,
    c.razon_social      AS comercializador,
    ca.nombre_agencia    AS centro_apuesta,
    rep.razon_social     AS representante_legal,
    l.categoria,
    l.numero_lot,
     l.id_centro,
     l.id_representante,
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
    b.nombre            AS pago_banco
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento       = de.id_documento
  JOIN personas            AS p  ON l.id_persona         = p.id_persona
  JOIN usuarios            AS u  ON de.emitido_por       = u.id_usuario
  LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta AS ca ON l.id_centro = ca.id_centro
  LEFT JOIN personas AS rep ON l.id_representante = rep.id_persona
  LEFT JOIN pagos AS pag ON pag.id_licencia = l.id_documento
  LEFT JOIN bancos AS b ON pag.id_banco = b.id_banco
  WHERE l.id_documento = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_licencias_vigentes = async () => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento       = de.id_documento
  JOIN personas            AS p  ON l.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
  WHERE de.estado_documento = 'vigente'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_licencia = async (data) => {
  const query = `
    INSERT INTO licencias (id_documento, id_persona, id_comercializador, id_centro, id_representante, categoria, numero_lot)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const values = [
    data.id_documento,
    data.id_persona,
    data.id_comercializador ?? null,
    data.id_centro ?? null,
    data.id_representante ?? null,
    data.categoria,
    data.numero_lot ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_licencia_id = async (id, data) => {
  const allowed = ["id_persona", "id_comercializador", "id_centro", "id_representante", "categoria", "numero_lot"];
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

  if (fields.length === 0) return [];

  const query = `
    UPDATE licencias SET ${fields.join(", ")}
    WHERE id_documento = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
};

//busquedas avanzadas----------------------------------------------------

export const buscar_licencias_por_persona = async (id_persona) => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento       = de.id_documento
  JOIN personas            AS p  ON l.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
  WHERE l.id_persona = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_persona]);
  return result.rows;
};

export const buscar_licencias_por_categoria = async (categoria) => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento       = de.id_documento
  JOIN personas            AS p  ON l.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
  WHERE l.categoria = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [categoria]);
  return result.rows;
};

export const buscar_licencias_por_comercializador = async (id_comercializador) => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento         = de.id_documento
  JOIN personas            AS p  ON l.id_persona           = p.id_persona
  JOIN comercializadores   AS c  ON l.id_comercializador   = c.id_comercializadores
  WHERE l.id_comercializador = $1
  ORDER BY de.created_at DESC
  `;
  const result = await pool.query(query, [id_comercializador]);
  return result.rows;
};

export const buscar_licencias_por_numero_lot = async (numero_lot) => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento = de.id_documento
  JOIN personas            AS p  ON l.id_persona   = p.id_persona
  WHERE l.numero_lot ILIKE $1
  `;
  const result = await pool.query(query, [`%${numero_lot}%`]);
  return result.rows;
};

export const buscar_licencias_proximas_a_vencer = async () => {
  const query = `
  SELECT
    l.id_documento,
    de.numero_documento,
    de.estado_documento,
    de.fecha_vencimiento,
    p.ci_rif,
    p.razon_social      AS persona,
    c.razon_social      AS comercializador,
    l.categoria,
    l.numero_lot,
    l.id_centro,
    l.id_representante
  FROM licencias AS l
  JOIN documentos_emitidos AS de ON l.id_documento       = de.id_documento
  JOIN personas            AS p  ON l.id_persona         = p.id_persona
  LEFT JOIN comercializadores AS c ON l.id_comercializador = c.id_comercializadores
  WHERE de.estado_documento = 'vigente'
    AND de.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY de.fecha_vencimiento ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};
