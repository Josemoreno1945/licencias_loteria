import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_permisos_juego = async () => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  LEFT JOIN comercializadores AS c  ON pj.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta   AS ca ON pj.id_centro          = ca.id_centro`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_permisos_juego_id = async (id) => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  LEFT JOIN comercializadores AS c  ON pj.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta   AS ca ON pj.id_centro          = ca.id_centro
  WHERE pj.id_permiso_juego = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_permisos_juego_activos = async () => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  LEFT JOIN comercializadores AS c  ON pj.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta   AS ca ON pj.id_centro          = ca.id_centro
  WHERE pj.estado = 'activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_permiso_juego = async (data) => {
  const query = `
    INSERT INTO permisos_juego (id_juego, id_comercializador, id_centro, nivel, estado, fecha_inicio, fecha_fin)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const values = [
    data.id_juego,
    data.id_comercializador ?? null,
    data.id_centro ?? null,
    data.nivel,
    data.estado,
    data.fecha_inicio,
    data.fecha_fin ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (borrado lógico) ---------------------------------
export const eliminar_permiso_juego_id = async (id) => {
  const query = `
    UPDATE permisos_juego
    SET estado = 'inactivo'
    WHERE id_permiso_juego = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_permiso_juego_id = async (id, data) => {
  const query = `
    UPDATE permisos_juego
    SET id_juego = $1, id_comercializador = $2, id_centro = $3, nivel = $4, estado = $5, fecha_inicio = $6, fecha_fin = $7
    WHERE id_permiso_juego = $8 RETURNING *`;
  const values = [
    data.id_juego,
    data.id_comercializador ?? null,
    data.id_centro ?? null,
    data.nivel,
    data.estado,
    data.fecha_inicio,
    data.fecha_fin ?? null,
    id,
  ];
  const result = await pool.query(query, values);
  return result.rows;
};

//busquedas avanzadas----------------------------------------------------

export const buscar_permisos_por_juego = async (id_juego) => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  LEFT JOIN comercializadores AS c  ON pj.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta   AS ca ON pj.id_centro          = ca.id_centro
  WHERE pj.id_juego = $1
  `;
  const result = await pool.query(query, [id_juego]);
  return result.rows;
};

export const buscar_permisos_por_comercializador = async (id_comercializador) => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.id_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  JOIN comercializadores AS c ON pj.id_comercializador = c.id_comercializadores
  WHERE pj.id_comercializador = $1
  `;
  const result = await pool.query(query, [id_comercializador]);
  return result.rows;
};

export const buscar_permisos_por_centro = async (id_centro) => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego   = j.id_juego
  JOIN centros_apuesta AS ca ON pj.id_centro  = ca.id_centro
  WHERE pj.id_centro = $1
  `;
  const result = await pool.query(query, [id_centro]);
  return result.rows;
};

export const buscar_permisos_por_nivel = async (nivel) => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  LEFT JOIN comercializadores AS c  ON pj.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta   AS ca ON pj.id_centro          = ca.id_centro
  WHERE pj.nivel = $1
  `;
  const result = await pool.query(query, [nivel]);
  return result.rows;
};

export const buscar_permisos_vencidos = async () => {
  const query = `
  SELECT
    pj.id_permiso_juego,
    j.nombre        AS nombre_juego,
    c.razon_social  AS comercializador,
    ca.nombre_agencia AS centro_apuesta,
    pj.nivel,
    pj.estado,
    pj.fecha_inicio,
    pj.fecha_fin
  FROM permisos_juego AS pj
  JOIN juegos         AS j  ON pj.id_juego           = j.id_juego
  LEFT JOIN comercializadores AS c  ON pj.id_comercializador = c.id_comercializadores
  LEFT JOIN centros_apuesta   AS ca ON pj.id_centro          = ca.id_centro
  WHERE pj.fecha_fin IS NOT NULL AND pj.fecha_fin < CURRENT_DATE
  `;
  const result = await pool.query(query);
  return result.rows;
};
