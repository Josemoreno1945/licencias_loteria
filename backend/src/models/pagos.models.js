import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_pagos = async () => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    lic.numero_documento  AS licencia,
    aut.numero_documento  AS autorizacion,
    par.numero_documento  AS participacion,
    u.nombre_usuario      AS registrado_por,
    p.created_at,
    p.updated_at
  FROM pagos AS p
  JOIN bancos   AS b ON p.id_banco      = b.id_banco
  JOIN usuarios AS u ON p.registrado_por = u.id_usuario
  LEFT JOIN documentos_emitidos AS lic ON p.id_licencia      = lic.id_documento
  LEFT JOIN documentos_emitidos AS aut ON p.id_autorizacion  = aut.id_documento
  LEFT JOIN documentos_emitidos AS par ON p.id_participacion = par.id_documento
  ORDER BY p.fecha_pago DESC`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_pagos_id = async (id) => {
  const query = `
  SELECT
    p.id_pago,
    p.id_banco,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    lic.numero_documento  AS licencia,
    aut.numero_documento  AS autorizacion,
    par.numero_documento  AS participacion,
    u.nombre_usuario      AS registrado_por,
    p.created_at,
    p.updated_at
  FROM pagos AS p
  JOIN bancos   AS b ON p.id_banco      = b.id_banco
  JOIN usuarios AS u ON p.registrado_por = u.id_usuario
  LEFT JOIN documentos_emitidos AS lic ON p.id_licencia      = lic.id_documento
  LEFT JOIN documentos_emitidos AS aut ON p.id_autorizacion  = aut.id_documento
  LEFT JOIN documentos_emitidos AS par ON p.id_participacion = par.id_documento
  WHERE p.id_pago = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_pago = async (data) => {
  const query = `
    INSERT INTO pagos (
      id_banco, num_referencia, fecha_pago, monto, tasa_dia,
      responsable_texto, id_licencia, id_autorizacion, id_participacion,
      observaciones, registrado_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
  const values = [
    data.id_banco,
    data.num_referencia,
    data.fecha_pago,
    data.monto,
    data.tasa_dia,
    data.responsable_texto ?? null,
    data.id_licencia ?? null,
    data.id_autorizacion ?? null,
    data.id_participacion ?? null,
    data.observaciones ?? null,
    data.registrado_por,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_pago_id = async (id, data) => {
  const query = `
    UPDATE pagos
    SET
      id_banco          = $1,
      num_referencia    = $2,
      fecha_pago        = $3,
      monto             = $4,
      tasa_dia          = $5,
      responsable_texto = $6,
      id_licencia       = $7,
      id_autorizacion   = $8,
      id_participacion  = $9,
      observaciones     = $10,
      updated_at        = NOW()
    WHERE id_pago = $11 RETURNING *`;
  const values = [
    data.id_banco,
    data.num_referencia,
    data.fecha_pago,
    data.monto,
    data.tasa_dia,
    data.responsable_texto ?? null,
    data.id_licencia ?? null,
    data.id_autorizacion ?? null,
    data.id_participacion ?? null,
    data.observaciones ?? null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//otros----------------------------------------------------

export const get_pago_referencia = async (num_referencia) => {
  const query = `
  SELECT num_referencia FROM pagos
  WHERE num_referencia = $1`;
  const result = await pool.query(query, [num_referencia]);
  return !!result.rows[0];
};

//busquedas avanzadas----------------------------------------------------

export const buscar_pagos_por_licencia = async (id_licencia) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    lic.numero_documento  AS licencia,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b   ON p.id_banco      = b.id_banco
  JOIN usuarios AS u   ON p.registrado_por = u.id_usuario
  JOIN documentos_emitidos AS lic ON p.id_licencia = lic.id_documento
  WHERE p.id_licencia = $1
  ORDER BY p.fecha_pago DESC
  `;
  const result = await pool.query(query, [id_licencia]);
  return result.rows;
};

export const buscar_pagos_por_autorizacion = async (id_autorizacion) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    aut.numero_documento  AS autorizacion,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b   ON p.id_banco       = b.id_banco
  JOIN usuarios AS u   ON p.registrado_por  = u.id_usuario
  JOIN documentos_emitidos AS aut ON p.id_autorizacion = aut.id_documento
  WHERE p.id_autorizacion = $1
  ORDER BY p.fecha_pago DESC
  `;
  const result = await pool.query(query, [id_autorizacion]);
  return result.rows;
};

export const buscar_pagos_por_participacion = async (id_participacion) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    par.numero_documento  AS participacion,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b   ON p.id_banco        = b.id_banco
  JOIN usuarios AS u   ON p.registrado_por   = u.id_usuario
  JOIN documentos_emitidos AS par ON p.id_participacion = par.id_documento
  WHERE p.id_participacion = $1
  ORDER BY p.fecha_pago DESC
  `;
  const result = await pool.query(query, [id_participacion]);
  return result.rows;
};

export const buscar_pagos_por_banco = async (id_banco) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b ON p.id_banco      = b.id_banco
  JOIN usuarios AS u ON p.registrado_por = u.id_usuario
  WHERE p.id_banco = $1
  ORDER BY p.fecha_pago DESC
  `;
  const result = await pool.query(query, [id_banco]);
  return result.rows;
};

export const buscar_pagos_por_rango_fecha = async (fecha_inicio, fecha_fin) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b ON p.id_banco      = b.id_banco
  JOIN usuarios AS u ON p.registrado_por = u.id_usuario
  WHERE p.fecha_pago BETWEEN $1 AND $2
  ORDER BY p.fecha_pago DESC
  `;
  const result = await pool.query(query, [fecha_inicio, fecha_fin]);
  return result.rows;
};

export const buscar_pago_por_referencia = async (num_referencia) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    lic.numero_documento  AS licencia,
    aut.numero_documento  AS autorizacion,
    par.numero_documento  AS participacion,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b ON p.id_banco      = b.id_banco
  JOIN usuarios AS u ON p.registrado_por = u.id_usuario
  LEFT JOIN documentos_emitidos AS lic ON p.id_licencia      = lic.id_documento
  LEFT JOIN documentos_emitidos AS aut ON p.id_autorizacion  = aut.id_documento
  LEFT JOIN documentos_emitidos AS par ON p.id_participacion = par.id_documento
  WHERE p.num_referencia ILIKE $1
  `;
  const result = await pool.query(query, [`%${num_referencia}%`]);
  return result.rows;
};

export const buscar_pagos_por_usuario = async (id_usuario) => {
  const query = `
  SELECT
    p.id_pago,
    b.nombre            AS banco,
    p.num_referencia,
    p.fecha_pago,
    p.monto,
    p.tasa_dia,
    p.responsable_texto,
    p.observaciones,
    u.nombre_usuario      AS registrado_por
  FROM pagos AS p
  JOIN bancos   AS b ON p.id_banco      = b.id_banco
  JOIN usuarios AS u ON p.registrado_por = u.id_usuario
  WHERE p.registrado_por = $1
  ORDER BY p.fecha_pago DESC
  `;
  const result = await pool.query(query, [id_usuario]);
  return result.rows;
};
