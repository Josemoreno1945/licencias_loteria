import { pool } from "../db.js";
import crypto from "crypto";

import { errors, throwError } from "../utils/errors.js";
import { buildDateString } from "../utils/validators.js";

const normalizeRepresentantes = (representantes) => {
  if (!representantes) return [];
  return representantes
    .map((r) => (r && typeof r === "object" ? r : { id_persona: r }))
    .filter((r) => r && r.id_persona);
};

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

    // 4. Validar licencia previa O autorización especial previa (XOR)
    if (data.id_licencia) {
      const licenciaRes = await client.query(
        `SELECT de.id_documento, de.estado_documento, de.fecha_expedicion, de.fecha_vencimiento
         FROM licencias AS l
         JOIN documentos_emitidos AS de ON l.id_documento = de.id_documento
         WHERE l.id_documento = $1`,
        [data.id_licencia],
      );

      if (!licenciaRes.rows[0]) {
        throwError(errors.licencia_no_encontrada);
      }

      const licencia = licenciaRes.rows[0];
      if (licencia.estado_documento !== "vigente") {
        throwError(errors.licencia_no_vigente);
      }
    }

    if (data.id_autorizacion_previa) {
      const autRes = await client.query(
        `SELECT de.id_documento, de.estado_documento
         FROM autorizaciones_especiales AS ae
         JOIN documentos_emitidos AS de ON ae.id_documento = de.id_documento
         WHERE ae.id_documento = $1`,
        [data.id_autorizacion_previa],
      );

      if (!autRes.rows[0]) {
        throwError(errors.autorizacion_no_encontrada);
      }
    }

    if (!data.id_licencia && !data.id_autorizacion_previa) {
      throwError(errors.invalidData);
    }

    // 5. Validar representantes (personas) si se proveen
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

    // 6. Validar el banco del pago
    const bancoExiste = await client.query(
      `SELECT 1 FROM bancos WHERE id_banco = $1`,
      [data.pago.id_banco],
    );
    if (!bancoExiste.rows[0]) {
      throwError(errors.bancos_no_encontrada);
    }

    const fecha_expedicion = buildDateString(data.fecha_expedicion);
    const fecha_vencimiento = data.fecha_vencimiento
      ? buildDateString(data.fecha_vencimiento)
      : buildDateString(
          new Date(
            new Date(fecha_expedicion).getTime() + 365 * 24 * 60 * 60 * 1000,
          ),
        );

    // Generamos el UUID del documento ANTES de insertar
    const documentoId = crypto.randomUUID();

    // 7. Crear el pago (vinculado a la participación que vamos a crear)
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
          data.id_licencia ?? null,
          null,
          documentoId,
          data.pago.observaciones ?? null,
          data.emitido_por,
        ],
      );
      pagoId = pagoResult.rows[0].id_pago;
    }

    // 8. Crear el documento emitido (tabla paraguas)
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

    // 9. Crear el detalle de la participación
    const participacionResult = await client.query(
      `INSERT INTO participaciones (
         id_documento, nro_archivo, id_persona, id_comercializador,
         id_licencia, id_autorizacion_previa, tipo, numero_lot,
         fecha_solicitud, territorio, observaciones
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        documento.id_documento,
        data.nro_archivo,
        solicitud.id_persona,
        solicitud.id_comercializador,
        data.id_licencia ?? null,
        data.id_autorizacion_previa ?? null,
        data.tipo,
        data.numero_lot ?? null,
        data.fecha_solicitud ? buildDateString(data.fecha_solicitud) : null,
        data.territorio ?? null,
        data.observaciones ?? null,
      ],
    );

    // 10. Insertar representantes legales (N:M) si se proveen
    for (const rep of representantes) {
      await client.query(
        `INSERT INTO participaciones_representantes (id_documento, id_persona, rol, cargo)
         VALUES ($1, $2, $3, $4)`,
        [documento.id_documento, rep.id_persona, rep.rol ?? null, rep.cargo ?? null],
      );
    }

    // 11. Marcar la solicitud como Aprobado si estaba Pendiente
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
