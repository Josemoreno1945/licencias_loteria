import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_comercializadores = async () => {
  const query = `
  SELECT c.id_comercializadores, c.rif, c.razon_social, c.direccion_fiscal, c.telefono, c.email, c.estado,
         COALESCE(
           json_agg(
             json_build_object(
               'id_persona', cr.id_persona,
               'razon_social', p.razon_social,
               'ci_rif', p.ci_rif,
               'cargo', cr.cargo
             ) ORDER BY p.razon_social
           ) FILTER (WHERE cr.id_c_representantes IS NOT NULL),
           '[]'::json
         ) AS representantes
  FROM comercializadores AS c
  LEFT JOIN comercializadores_representantes AS cr ON c.id_comercializadores = cr.id_comercializador AND cr.estado = 'activo'
  LEFT JOIN personas AS p ON cr.id_persona = p.id_persona
  GROUP BY c.id_comercializadores`;
  const result = await pool.query(query);
  return result.rows;
};

export const get_comercializadores_id = async (id) => {
  const query = ` 
  SELECT id_comercializadores, rif, razon_social, direccion_fiscal, telefono, email, estado
  FROM comercializadores
  WHERE id_comercializadores = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

export const get_comercializadores_activos = async () => {
  const query = `
    SELECT id_comercializadores, rif, razon_social, direccion_fiscal, telefono, email, estado
    FROM comercializadores
    WHERE estado = 'activo'
  `;
  const result = await pool.query(query);
  return result.rows;
};

//post------------------------------------------------------------
export const crear_comercializador = async (data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO comercializadores (rif, razon_social, direccion_fiscal, telefono, email, estado)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [
      data.rif,
      data.razon_social,
      data.direccion_fiscal,
      data.telefono,
      data.email,
      data.estado || 'activo',
    ];
    const result = await client.query(query, values);
    const comercializadorCreado = result.rows[0];

    // Insertar todos los representantes en la tabla puente
    if (data.representantes && data.representantes.length > 0) {
      for (const rep of data.representantes) {
        const repQuery = `
          INSERT INTO comercializadores_representantes (id_comercializador, id_persona, cargo, estado)
          VALUES ($1, $2, $3, 'activo');
        `;
        await client.query(repQuery, [
          comercializadorCreado.id_comercializadores,
          rep.id_persona,
          rep.cargo || '',
        ]);
      }
    }

    await client.query('COMMIT');
    return comercializadorCreado;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// delete (borrado lógico) ---------------------------------
export const eliminar_comercializador_id = async (id) => {
  const query = `
    UPDATE comercializadores 
    SET estado = 'inactivo' 
    WHERE id_comercializadores = $1 
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows;
};

//put---------------------------------------------------
export const actualizar_comercializador_id = async (id, data) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar campos básicos del comercializador
    const allowed = ["rif", "razon_social", "direccion_fiscal", "telefono", "email", "estado"];
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

    if (fields.length > 0) {
      const query = `
        UPDATE comercializadores SET ${fields.join(", ")}, updated_at = NOW()
        WHERE id_comercializadores = $${i} RETURNING *`;
      values.push(id);
      await client.query(query, values);
    }

    // Si se enviaron representantes, sincronizarlos
    if (data.representantes && Array.isArray(data.representantes)) {
      // Desactivar representantes anteriores
      await client.query(
        "UPDATE comercializadores_representantes SET estado = 'inactivo' WHERE id_comercializador = $1",
        [id]
      );

      // Insertar/actualizar representantes
      for (const rep of data.representantes) {
        // Verificar si ya existe un registro para esta persona en este comercializador
        const existingQuery = `
          SELECT id_c_representantes FROM comercializadores_representantes 
          WHERE id_comercializador = $1 AND id_persona = $2
        `;
        const existing = await client.query(existingQuery, [id, rep.id_persona]);

        if (existing.rows.length > 0) {
          // Reactivar el existente
          await client.query(
            "UPDATE comercializadores_representantes SET estado = 'activo', cargo = $1 WHERE id_c_representantes = $2",
            [rep.cargo || '', existing.rows[0].id_c_representantes]
          );
        } else {
          // Insertar nuevo
          await client.query(
            'INSERT INTO comercializadores_representantes (id_comercializador, id_persona, cargo, estado) VALUES ($1, $2, $3, $4)',
            [id, rep.id_persona, rep.cargo || '', 'activo']
          );
        }
      }
    }

    await client.query('COMMIT');

    // Obtener el comercializador actualizado
    const result = await pool.query('SELECT * FROM comercializadores WHERE id_comercializadores = $1', [id]);
    return result.rows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

//otros----------------------------------------------------

export const get_comercializador_email = async (email) => {
  const query = `
  SELECT id_comercializadores, rif, razon_social, direccion_fiscal, telefono, email, estado
  FROM comercializadores
  WHERE email = $1`;
  const result = await pool.query(query, [email]);
  return !!result.rows[0];
};

export const get_comercializador_rif = async (rif) => {
  const query = `
  SELECT id_comercializadores, rif, razon_social, direccion_fiscal, telefono, email, estado
  FROM comercializadores
  WHERE rif = $1`;
  const result = await pool.query(query, [rif]);
  return !!result.rows[0];
};

// Detalle completo: datos del comercializador + sus representantes activos
export const get_comercializador_detalle_completo = async (id) => {
  // Datos del comercializador
  const comQuery = `
  SELECT id_comercializadores, rif, razon_social, direccion_fiscal, telefono, email, estado
  FROM comercializadores
  WHERE id_comercializadores = $1
  `;
  const comResult = await pool.query(comQuery, [id]);
  if (!comResult.rows[0]) return null;

  // Representantes activos vinculados
  const repQuery = `
  SELECT cr.id_c_representantes, cr.id_persona, cr.cargo, cr.estado,
         p.razon_social, p.ci_rif, p.telefono, p.email
  FROM comercializadores_representantes AS cr
  JOIN personas AS p ON cr.id_persona = p.id_persona
  WHERE cr.id_comercializador = $1 AND cr.estado = 'activo'
  ORDER BY p.razon_social
  `;
  const repResult = await pool.query(repQuery, [id]);

  // Deduplicado por id_persona
  const vistos = new Set();
  const representantes = repResult.rows.filter((r) => {
    if (vistos.has(r.id_persona)) return false;
    vistos.add(r.id_persona);
    return true;
  });

  return {
    ...comResult.rows[0],
    representantes,
  };
};
