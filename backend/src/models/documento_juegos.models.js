import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_documento_juegos = async () => {
  const query = `
  SELECT
    dj.id_doc_juego,
    de.numero_documento,
    de.tipo            AS tipo_documento,
    de.estado_documento,
    j.nombre           AS nombre_juego
  FROM documento_juegos AS dj
  JOIN documentos_emitidos AS de ON dj.id_documento = de.id_documento
  JOIN juegos              AS j  ON dj.id_juego     = j.id_juego`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_documento_juegos_id = async (id) => {
  const query = `
  SELECT
    dj.id_doc_juego,
    de.numero_documento,
    de.tipo            AS tipo_documento,
    de.estado_documento,
    j.nombre           AS nombre_juego
  FROM documento_juegos AS dj
  JOIN documentos_emitidos AS de ON dj.id_documento = de.id_documento
  JOIN juegos              AS j  ON dj.id_juego     = j.id_juego
  WHERE dj.id_doc_juego = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_documento_juego = async (data) => {
  const query = `
    INSERT INTO documento_juegos (id_documento, id_juego)
    VALUES ($1, $2) RETURNING *`;
  const values = [data.id_documento, data.id_juego];
  const result = await pool.query(query, values);
  return result.rows;
};

// delete (real, porque la tabla usa ON DELETE CASCADE desde documentos_emitidos) ---------------------------------
export const eliminar_documento_juego_id = async (id) => {
  const query = `
    DELETE FROM documento_juegos
    WHERE id_doc_juego = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//busquedas avanzadas----------------------------------------------------

export const buscar_juegos_por_documento = async (id_documento) => {
  const query = `
  SELECT
    dj.id_doc_juego,
    de.numero_documento,
    de.tipo            AS tipo_documento,
    de.estado_documento,
    j.id_juego,
    j.nombre           AS nombre_juego
  FROM documento_juegos AS dj
  JOIN documentos_emitidos AS de ON dj.id_documento = de.id_documento
  JOIN juegos              AS j  ON dj.id_juego     = j.id_juego
  WHERE dj.id_documento = $1
  `;
  const result = await pool.query(query, [id_documento]);
  return result.rows;
};

export const buscar_documentos_por_juego = async (id_juego) => {
  const query = `
  SELECT
    dj.id_doc_juego,
    de.id_documento,
    de.numero_documento,
    de.tipo            AS tipo_documento,
    de.estado_documento,
    de.fecha_expedicion,
    de.fecha_vencimiento,
    j.nombre           AS nombre_juego
  FROM documento_juegos AS dj
  JOIN documentos_emitidos AS de ON dj.id_documento = de.id_documento
  JOIN juegos              AS j  ON dj.id_juego     = j.id_juego
  WHERE dj.id_juego = $1
  ORDER BY de.fecha_vencimiento DESC
  `;
  const result = await pool.query(query, [id_juego]);
  return result.rows;
};

export const get_documento_juego_duplicado = async (id_documento, id_juego) => {
  const query = `
  SELECT id_doc_juego FROM documento_juegos
  WHERE id_documento = $1 AND id_juego = $2`;
  const result = await pool.query(query, [id_documento, id_juego]);
  return !!result.rows[0];
};
