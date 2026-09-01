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

export const crear_autorizacion_completa = async (data) => {
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
    if (solicitud.tipo_tramite !== "Autorizacion_especial") {
      throwError(errors.solicitud_no_es_autorizacion_especial);
    }

    if (solicitud.estado === "Rechazada") {
      throwError(errors.solicitud_rechazada);
    }

    // 2. La solicitud aún no puede tener un documento emitido asociado
    const existingDoc = await client.query(
      `SELECT 1 FROM documentos_emitidos WHERE id_solicitud = $1`,
      [data.id_solicitud],
    );
    if (existingDoc.rows.length > 0) {
      throwError(errors.solicitud_con_documento_emitido);
    }

    // 3. Unicidad de numero_documento y papel_seguridad
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

    // 4. Extraer el centro de apuesta de la solicitud original (solicitud_centros)
    let centroSolicitud = null;
    const centrosRes = await client.query(
      `SELECT id_centro FROM solicitud_centros WHERE id_solicitud = $1 LIMIT 1`,
      [data.id_solicitud],
    );
    if (centrosRes.rows.length > 0) {
      centroSolicitud = centrosRes.rows[0].id_centro;
    }

    const id_centro_final = data.id_centro ?? centroSolicitud ?? null;

    if (id_centro_final) {
      const centroExiste = await client.query(
        `SELECT 1 FROM centros_apuesta WHERE id_centro = $1`,
        [id_centro_final],
      );
      if (!centroExiste.rows[0]) {
        throwError(errors.centros_apuesta_no_encontrada);
      }
    }

    // 5. Representantes legales: usar los enviados o extraer TODOS de la comercializadora
    let representantes = normalizeRepresentantes(data.representantes);

    if (representantes.length === 0 && solicitud.id_comercializador) {
      const repRes = await client.query(
        `SELECT cr.id_persona, cr.cargo, ''::text AS rol
         FROM comercializadores_representantes AS cr
         WHERE cr.id_comercializador = $1
           AND cr.estado = 'activo'
         ORDER BY cr.id_persona`,
        [solicitud.id_comercializador],
      );
      representantes = repRes.rows;
    }

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

    // 5.5 Juegos: usar los enviados o extraerlos de la solicitud previa
    let juegos = Array.isArray(data.juegos) && data.juegos.length > 0
      ? [...new Set(data.juegos)]
      : [];

    if (juegos.length === 0) {
      const juegosRes = await client.query(
        `SELECT id_juego FROM solicitud_juegos WHERE id_solicitud = $1`,
        [data.id_solicitud],
      );
      juegos = juegosRes.rows.map((r) => r.id_juego);
    }

    if (juegos.length > 0) {
      const valuesList = juegos.map((_, idx) => `($${idx + 1})`).join(", ");
      const juegoCheck = await client.query(
        `SELECT id_juego FROM juegos WHERE id_juego IN (${valuesList})`,
        juegos,
      );
      const foundJuegos = new Set(juegoCheck.rows.map((r) => r.id_juego));
      for (const id_juego of juegos) {
        if (!foundJuegos.has(id_juego)) {
          throwError(errors.juegos_no_encontrados);
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

    // 7. Crear el pago (vinculado a la autorización que vamos a crear)
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
          null,
          documentoId,
          null,
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
        "Autorizacion_especial",
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

    // 9. Crear el detalle de autorizaciones_especiales
    const autorizacionResult = await client.query(
      `INSERT INTO autorizaciones_especiales (
         id_documento, nro_mesa, tipo, id_persona,
         id_comercializador, id_centro, agencia_texto, numero_lot,
         direccion_centro_asignado, direccion_localidad, direccion_responsable, otros
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        documento.id_documento,
        data.nro_mesa ?? null,
        data.tipo ?? "Mesa",
        solicitud.id_persona,
        data.id_comercializador ?? solicitud.id_comercializador ?? null,
        id_centro_final,
        data.agencia_texto ?? null,
        data.numero_lot ?? null,
        data.direccion_centro_asignado ?? null,
        data.direccion_localidad ?? null,
        data.direccion_responsable ?? null,
        data.otros ?? null,
      ],
    );

    // 10. Insertar representantes legales (N:M) si se proveen
    for (const rep of representantes) {
      await client.query(
        `INSERT INTO autorizaciones_representantes (id_documento, id_persona, rol, cargo)
         VALUES ($1, $2, $3, $4)`,
        [documento.id_documento, rep.id_persona, rep.rol ?? null, rep.cargo ?? null],
      );
    }

    // 10.5 Insertar juegos
    if (juegos.length > 0) {
      const uniqueJuegos = [...new Set(juegos)];
      for (const id_juego of uniqueJuegos) {
        await client.query(
          `INSERT INTO documento_juegos (id_documento, id_juego)
           VALUES ($1, $2)`,
          [documento.id_documento, id_juego],
        );
      }
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
      autorizacion: autorizacionResult.rows[0],
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
