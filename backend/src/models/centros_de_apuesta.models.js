import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_centros_apuesta = async () => {
  const query = `
  SELECT ca.id_centro, ca.id_comercializador, c.razon_social AS comercializador_razon_social, p.ci_rif AS persona_ci_rif, p.razon_social AS persona_razon_social, ca.nombre_agencia, ca.direccion, ca.estado,
         COALESCE(
           json_agg(
             json_build_object(
               'id_persona', car.id_persona,
               'razon_social', rp.razon_social,
               'ci_rif', rp.ci_rif,
               'cargo', car.cargo
             ) ORDER BY rp.razon_social
           ) FILTER (WHERE car.id_ca_representante IS NOT NULL),
           '[]'::json
         ) AS representantes
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  LEFT JOIN centros_apuesta_representantes AS car ON ca.id_centro = car.id_centro AND car.estado = 'activo'
  LEFT JOIN personas AS rp ON car.id_persona = rp.id_persona
  GROUP BY ca.id_centro, c.razon_social, p.ci_rif, p.razon_social`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_centros_apuesta_id = async (id) => {
  const query = ` 
  SELECT ca.id_centro, ca.id_comercializador, ca.id_persona, c.razon_social AS comercializador_razon_social, p.ci_rif AS persona_ci_rif, p.razon_social AS persona_razon_social, ca.nombre_agencia, ca.direccion, ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.id_centro=$1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_centros_apuesta_activos = async () => {
  const query = `
  SELECT ca.id_centro, ca.id_comercializador, c.razon_social AS comercializador_razon_social, p.ci_rif AS persona_ci_rif, p.razon_social AS persona_razon_social, ca.nombre_agencia, ca.direccion, ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.estado='activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_centros_apuesta = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // El primer representante es el titular (id_persona en centros_apuesta)
    const idPersonaTitular = data.representantes?.[0]?.id_persona || data.id_persona;

    const query = `
      INSERT INTO centros_apuesta (id_comercializador, id_persona, nombre_agencia, direccion, estado)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const values = [
      data.id_comercializador,
      idPersonaTitular,
      data.nombre_agencia,
      data.direccion,
      data.estado || 'activo',
    ];
    const result = await client.query(query, values);
    const centroCreado = result.rows[0];

    // Insertar todos los representantes en la tabla puente
    if (data.representantes && data.representantes.length > 0) {
      for (const rep of data.representantes) {
        const repQuery = `
          INSERT INTO centros_apuesta_representantes (id_centro, id_persona, cargo, estado)
          VALUES ($1, $2, $3, 'activo');
        `;
        await client.query(repQuery, [
          centroCreado.id_centro,
          rep.id_persona,
          rep.cargo || 'Representante Legal',
        ]);
      }
    }

    await client.query('COMMIT');
    return centroCreado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// delete (borrado lógico) ---------------------------------
export const eliminar_centros_apuesta_id = async (id) => {
  const query = `
    UPDATE centros_apuesta
    SET estado = 'inactivo' 
    WHERE id_centro = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_centros_apuesta_id = async (id, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar campos básicos del centro
    const allowed = ["nombre_agencia", "direccion", "estado"];
    const fields = [];
    const values = [];
    let i = 1;

    for (const col of allowed) {
      if (data[col] !== undefined) {
        fields.push(`${col} = $${i}`);
        values.push(data[col]);
        i++;
      }
    }

    let centroActualizado = null;

    if (fields.length > 0) {
      const query = `
        UPDATE centros_apuesta SET ${fields.join(", ")}, updated_at = NOW()
        WHERE id_centro = $${i} RETURNING *`;
      values.push(id);
      const result = await client.query(query, values);
      centroActualizado = result.rows;
    }

    // Si se enviaron representantes, sincronizarlos
    if (data.representantes && Array.isArray(data.representantes)) {
      // Actualizar id_persona titular (primer representante)
      if (data.representantes.length > 0 && data.representantes[0].id_persona) {
        await client.query(
          'UPDATE centros_apuesta SET id_persona = $1 WHERE id_centro = $2',
          [data.representantes[0].id_persona, id]
        );
      }

      // Desactivar representantes anteriores
      await client.query(
        "UPDATE centros_apuesta_representantes SET estado = 'inactivo' WHERE id_centro = $1",
        [id]
      );

      // Insertar/actualizar representantes
      for (const rep of data.representantes) {
        // Verificar si ya existe un registro para esta persona en este centro
        const existingQuery = `
          SELECT id_ca_representante FROM centros_apuesta_representantes 
          WHERE id_centro = $1 AND id_persona = $2
        `;
        const existing = await client.query(existingQuery, [id, rep.id_persona]);

        if (existing.rows.length > 0) {
          // Reactivar el existente
          await client.query(
            "UPDATE centros_apuesta_representantes SET estado = 'activo', cargo = $1 WHERE id_ca_representante = $2",
            [rep.cargo || 'Representante Legal', existing.rows[0].id_ca_representante]
          );
        } else {
          // Insertar nuevo
          await client.query(
            'INSERT INTO centros_apuesta_representantes (id_centro, id_persona, cargo, estado) VALUES ($1, $2, $3, $4)',
            [id, rep.id_persona, rep.cargo || 'Representante Legal', 'activo']
          );
        }
      }
    }

    await client.query('COMMIT');

    // Obtener el centro actualizado
    const result = await pool.query('SELECT * FROM centros_apuesta WHERE id_centro = $1', [id]);
    return result.rows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

//otros----------------------------------------------------

export const get_centros_apuesta_nombre = async (email) => {
  const query = `
  SELECT ca.id_centro, c.razon_social AS comercializador_razon_social, p.ci_rif AS persona_ci_rif, p.razon_social AS persona_razon_social, ca.nombre_agencia, ca.direccion, ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.nombre_agencia=$1
  `;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

// Centros activos filtrados por comercializador (para el Select del formulario)
export const get_centros_por_comercializador = async (id_comercializador) => {
  const query = `
  SELECT ca.id_centro, ca.nombre_agencia, ca.direccion, ca.estado
  FROM centros_apuesta AS ca
  WHERE ca.id_comercializador = $1 AND ca.estado = 'activo'
  ORDER BY ca.nombre_agencia
  `;
  const result = await pool.query(query, [id_comercializador]);
  return result.rows;
};

// Detalle completo: datos del centro + comercializadora + representantes activos
export const get_centro_detalle_completo = async (id) => {
  // Datos del centro, su dueño/titular y la comercializadora asociada
  const centroQuery = `
  SELECT ca.id_centro, ca.id_comercializador, ca.nombre_agencia, ca.direccion, ca.estado,
         p.id_persona, p.ci_rif, p.razon_social,
         c.rif               AS comercializador_rif,
         c.razon_social      AS comercializador_razon_social,
         c.direccion_fiscal  AS comercializador_direccion,
         c.telefono          AS comercializador_telefono,
         c.email             AS comercializador_email
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.id_centro = $1
  `;
  const centroResult = await pool.query(centroQuery, [id]);
  if (!centroResult.rows[0]) return null;

  const centro = centroResult.rows[0];

  // Representantes activos del centro (tabla puente)
  const repQuery = `
  SELECT car.id_ca_representante, car.id_persona, car.cargo, car.estado,
         p.razon_social, p.ci_rif, p.telefono, p.email
  FROM centros_apuesta_representantes AS car
  JOIN personas AS p ON car.id_persona = p.id_persona
  WHERE car.id_centro = $1 AND car.estado = 'activo'
  ORDER BY p.razon_social
  `;
  const repResult = await pool.query(repQuery, [id]);

  let representantes = repResult.rows;

  // Si el titular (id_persona del centro) NO está en la tabla puente,
  // lo agregamos como representante principal para no perderlo (compatibilidad con datos antiguos)
  const titularEnPuente = representantes.some(
    (r) => r.id_persona === centro.id_persona
  );

  if (!titularEnPuente) {
    representantes = [
      {
        id_persona: centro.id_persona,
        ci_rif: centro.ci_rif,
        razon_social: centro.razon_social,
        cargo: 'Representante Legal',
      },
      ...representantes,
    ];
  }

  // Deduplicado por id_persona (por si existiera algún registro repetido)
  const vistos = new Set();
  representantes = representantes.filter((r) => {
    if (vistos.has(r.id_persona)) return false;
    vistos.add(r.id_persona);
    return true;
  });

  return {
    ...centro,
    representantes,
  };
};
