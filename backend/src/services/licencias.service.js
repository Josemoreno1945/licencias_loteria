import { pool } from "../db.js";
import { errors, throwError } from "../utils/errors.js";

const buildDateString = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throwError(errors.invalidData);
  }
  return date.toISOString().slice(0, 10);
};

export const crear_licencia_completa = async (data) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const solicitudRes = await client.query(
      `SELECT tipo_tramite, categoria_licencia, id_persona, id_comercializador, estado
       FROM solicitudes
       WHERE id_solicitudes = $1`,
      [data.id_solicitud],
    );

    if (!solicitudRes.rows[0]) {
      throwError(errors.solicitud_no_encontrada);
    }

    const solicitud = solicitudRes.rows[0];
    if (solicitud.tipo_tramite !== "Licencia") {
      throwError(errors.solicitud_no_es_licencia);
    }

    if (solicitud.estado === "Rechazada") {
      throwError(errors.solicitud_rechazada);
    }

    if (!solicitud.categoria_licencia) {
      throwError(errors.solicitud_sin_categoria_licencia);
    }

    const existingDoc = await client.query(
      `SELECT 1 FROM documentos_emitidos WHERE id_solicitud = $1`,
      [data.id_solicitud],
    );
    if (existingDoc.rows.length > 0) {
      throwError(errors.solicitud_con_documento_emitido);
    }

    const numeroExists = await client.query(
      `SELECT 1 FROM documentos_emitidos WHERE numero_documento = $1`,
      [data.numero_documento],
    );
    if (numeroExists.rows.length > 0) {
      throwError(errors.documento_numero_duplicado);
    }

    const papelExists = await client.query(
      `SELECT 1 FROM documentos_emitidos WHERE papel_seguridad = $1`,
      [data.papel_seguridad],
    );
    if (papelExists.rows.length > 0) {
      throwError(errors.documento_papel_duplicado);
    }

    const fecha_expedicion = buildDateString(data.fecha_expedicion);
    const fecha_emision = buildDateString(data.fecha_emision);
    const fecha_vencimiento = data.fecha_vencimiento
      ? buildDateString(data.fecha_vencimiento)
      : buildDateString(
          new Date(
            new Date(fecha_expedicion).getTime() + 365 * 24 * 60 * 60 * 1000,
          ),
        );
    const fecha_entrega = data.fecha_entrega
      ? buildDateString(data.fecha_entrega)
      : null;

    const documentoResult = await client.query(
      `INSERT INTO documentos_emitidos (
         id_solicitud, tipo, tipo_emision, id_documento_anterior,
         numero_documento, papel_seguridad, estado_documento,
         fecha_expedicion, fecha_vencimiento, fecha_emision,
         fecha_entrega, direccion_establecimiento, detalles_extra, emitido_por
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        data.id_solicitud,
        "Licencia",
        data.tipo_emision ?? "Inscripcion",
        data.id_documento_anterior ?? null,
        data.numero_documento,
        data.papel_seguridad,
        data.estado_documento ?? "vigente",
        fecha_expedicion,
        fecha_vencimiento,
        fecha_emision,
        fecha_entrega,
        data.direccion_establecimiento ?? null,
        data.detalles_extra ? JSON.stringify({ observaciones: data.detalles_extra }) : null,
        data.emitido_por,
      ],
    );

    const documento = documentoResult.rows[0];

    const licenciaResult = await client.query(
      `INSERT INTO licencias (id_documento, id_persona, id_comercializador, categoria, numero_lot)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        documento.id_documento,
        solicitud.id_persona,
        solicitud.id_comercializador ?? null,
        solicitud.categoria_licencia,
        data.numero_lot ?? null,
      ],
    );

    if (Array.isArray(data.juegos) && data.juegos.length > 0) {
      const uniqueJuegos = [...new Set(data.juegos)];
      for (const id_juego of uniqueJuegos) {
        await client.query(
          `INSERT INTO documento_juegos (id_documento, id_juego)
           VALUES ($1, $2)`,
          [documento.id_documento, id_juego],
        );
      }
    }

    if (solicitud.estado === "Pendiente") {
      await client.query(
        `UPDATE solicitudes SET estado = 'Aprobado' WHERE id_solicitudes = $1`,
        [data.id_solicitud],
      );
    }

    await client.query("COMMIT");

    return {
      documento_emitido: documento,
      licencia: licenciaResult.rows[0],
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
