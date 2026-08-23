import { pool } from "../db.js";
import crypto from "crypto";

import { errors, throwError } from "../utils/errors.js";

const buildDateString = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throwError(errors.invalidData);
  }
  return date.toISOString().slice(0, 10);
};

const normalizeRepresentantes = (representantes) => {
  if (!representantes) return [];
  return representantes
    .map((r) => (r && typeof r === "object" ? r : { id_persona: r }))
    .filter((r) => r && r.id_persona);
};

/**
 * Crea una participación de forma transaccional, espejando el flujo de
 * `crear_licencia_completa`:
 *   1. Valida la solicitud de trámite (tipo_tramite = 'Participacion').
 *   2. Hereda id_persona e id_comercializador de la solicitud.
 *   3. Verifica unicidad de número de documento y papel de seguridad.
 *   4. Valida representantes legales, el banco del pago y la licencia referenciada (si aplica).
 *   5. Calcula la fecha de vencimiento (+365 días desde expedición).
 *   6. Genera el UUID del documento ANTES de insertar.
 *   7. Crea el pago (vinculado a la participación que se va a crear).
 *      Para pagos de participación, pagos.id_licencia e id_autorizacion se
 *      dejan en NULL; el vínculo se hace vía pagos.id_participacion.
 *   8. Crea el documento emitido (tabla paraguas, tipo = 'Participacion').
 *   9. Crea el detalle de la participación (tipo, id_persona, id_comercializador,
 *      id_centro, id_licencia, numero_lot, nro_archivo).
 *  10. Inserta representantes legales (N:M) y juegos (N:M) si se proveen.
 *  11. Marca la solicitud como 'Aprobado' si estaba 'Pendiente'.
 */
export const crear_participacion_completa = async (data) => {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    await client.query("SET CONSTRAINTS ALL DEFERRED");

    // 1. Validar la solicitud de trámite
    const solicitudRes = await client.query(
      `SELECT tipo_tramite, id_persona, id_comercializador, estado
       FROM solicitudes
       WHERE id_solicitudes = $1`,
      [data.id_solicitud],
    );

    if (!solicitudRes.rows[0]) {
      throwError(errors.solicitud_no_encontrada);
    }

    const solicitud = solicitudRes.rows[0];
    if (solicitud.tipo_tramite !== "Participacion") {
      throwError(errors.solicitud_no_es_participacion);
    }

    if (solicitud.estado === "Rechazada") {
      throwError(errors.solicitud_rechazada);
    }

    if (!solicitud.id_comercializador) {
      throwError(errors.solicitud_sin_comercializador);
    }

    // 2. La solicitud aún no puede tener un documento emitido asociado
    const existingDoc = await client.query(
      `SELECT 1 FROM documentos_emitidos WHERE id_solicitud = $1`,
      [data.id_solicitud],
    );
    if (existingDoc.rows.length > 0) {
      throwError(errors.solicitud_con_documento_emitido);
    }

    // 3. Unicidad de número de documento y papel de seguridad
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

    // 4. Validar representantes legales (personas) si se proveen
    const representantes = normalizeRepresentantes(data.representantes);
    if (representantes.length > 0) {
      const valuesList = representantes.map((_, idx) => `($${idx + 1})`).join(", ");
      const valuesFlat = representantes.map((r) => r.id_persona);
      const repCheck = await client.query(
        `SELECT id_persona FROM personas WHERE id_persona IN (${valuesList})`,
        valuesFlat,
      );
      const found = new Set(repCheck.rows.map((r) => r.id_persona));
      for (const rep of representantes) {
        if (!found.has(rep.id_persona)) {
          throwError(errors.persona_no_encontrada);
        }
      }
    }

    // 5. Validar el banco del pago
    const bancoExiste = await client.query(
      `SELECT 1 FROM bancos WHERE id_banco = $1`,
      [data.pago.id_banco],
    );
    if (!bancoExiste.rows[0]) {
      throwError(errors.bancos_no_encontrada);
    }

    // 6. Validar la licencia referenciada (si se provee)
    if (data.id_licencia) {
      const licExiste = await client.query(
        `SELECT 1 FROM licencias WHERE id_documento = $1`,
        [data.id_licencia],
      );
      if (!licExiste.rows[0]) {
        throwError(errors.licencia_no_encontrada);
      }
    }

    // 7. Validar juegos (si se proveen)
    if (Array.isArray(data.juegos) && data.juegos.length > 0) {
      const uniqueJuegos = [...new Set(data.juegos)];
      const valuesList = uniqueJuegos.map((_, idx) => `($${idx + 1})`).join(", ");
      const juegoCheck = await client.query(
        `SELECT id_juego FROM juegos WHERE id_juego IN (${valuesList})`,
        uniqueJuegos,
      );
      const foundJuegos = new Set(juegoCheck.rows.map((r) => r.id_juego));
      for (const id_juego of uniqueJuegos) {
        if (!foundJuegos.has(id_juego)) {
          throwError(errors.juegos_no_encontrados);
        }
      }
    }

    const fecha_expedicion = buildDateString(data.fecha_expedicion);
    const fecha_vencimiento = data.fecha_vencimiento
      ? buildDateString(data.fecha_vencimiento)
      : buildDateString(
          new Date(
            new Date(fecha_expedicion).getTime() + 365 * 24 * 60 * 60 * 1000,
          ),
        );

    // 8. Generamos el UUID del documento ANTES de insertar
    const documentoId = crypto.randomUUID();

    // 9. Crear el pago PRIMERO (referenciado por el trigger de licencias vigentes)
    //    Para participaciones, id_licencia e id_autorizacion se dejan NULL.
    let pagoId = null;
    if (data.pago) {
      const pagoResult = await client.query(
        `INSERT INTO pagos (
           id_banco, num_referencia, fecha_pago, monto, tasa_dia,
           responsable_texto, id_licencia, id_autorizacion, id_participacion, observaciones, registrado_por
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id_pago`,
        [
          data.pago.id_banco,
          data.pago.num_referencia,
          data.pago.fecha_pago,
          data.pago.monto,
          data.pago.tasa_dia,
          data.pago.responsable_texto ?? null,
          null,            // id_licencia — siempre NULL en este flujo (pago de participación)
          null,            // id_autorizacion — siempre NULL en este flujo
          documentoId,     // id_participacion — vinculamos a la participación que vamos a crear
          data.pago.observaciones ?? null,
          data.emitido_por,
        ],
      );
      pagoId = pagoResult.rows[0].id_pago;
    }

    // 10. Crear el documento emitido (tabla paraguas)
    const documentoResult = await client.query(
      `INSERT INTO documentos_emitidos (
         id_documento, id_solicitud, tipo, tipo_emision, id_documento_anterior,
         numero_documento, papel_seguridad, estado_documento,
         fecha_expedicion, fecha_vencimiento,
         direccion_establecimiento, detalles_extra, observaciones, emitido_por
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        documentoId,
        data.id_solicitud,
        "Participacion",
        data.tipo_emision ?? "Inscripcion",
        data.id_documento_anterior ?? null,
        data.numero_documento,
        data.papel_seguridad,
        data.estado_documento ?? "vigente",
        fecha_expedicion,
        fecha_vencimiento,
        data.direccion_establecimiento ?? null,
        data.detalles_extra ? JSON.stringify({ observaciones: data.detalles_extra }) : null,
        data.observaciones ?? null,
        data.emitido_por,
      ],
    );

    const documento = documentoResult.rows[0];

    // 11. Crear el detalle de la participación
    const participacionResult = await client.query(
      `INSERT INTO participaciones (
         id_documento, tipo, id_persona, id_comercializador, id_centro, id_licencia, numero_lot, nro_archivo
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        documento.id_documento,
        data.tipo,
        solicitud.id_persona,
        solicitud.id_comercializador ?? null,
        data.id_centro ?? null,
        data.id_licencia ?? null,
        data.numero_lot ?? null,
        data.nro_archivo ?? null,
      ],
    );

    // 12. Insertar representantes legales (N:M) si se proveen
    for (const rep of representantes) {
      await client.query(
        `INSERT INTO participaciones_representantes (id_documento, id_persona, rol, cargo)
         VALUES ($1, $2, $3, $4)`,
        [documento.id_documento, rep.id_persona, rep.rol ?? null, rep.cargo ?? null],
      );
    }

    // 13. Insertar juegos (N:M) si se proveen
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

    // 14. Marcar la solicitud como Aprobado si estaba Pendiente
    if (solicitud.estado === "Pendiente") {
      await client.query(
        `UPDATE solicitudes SET estado = 'Aprobado' WHERE id_solicitudes = $1`,
        [data.id_solicitud],
      );
    }

    await client.query("COMMIT");

    return {
      documento_emitido: documento,
      participacion: participacionResult.rows[0],
      pago: pagoId ? { id_pago: pagoId } : null,
    };
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};
