import { pool } from "../db.js";

//get--------------------------------------------------------------------
export const get_centros_apuesta = async () => {
  const query = `
  SELECT ca.id_centro, ca.id_comercializador, c.razon_social AS comercializador_razon_social, p.ci_rif AS persona_ci_rif, p.razon_social AS persona_razon_social, ca.nombre_agencia, ca.direccion, ca.estado
  FROM centros_apuesta AS ca
  JOIN comercializadores AS c ON ca.id_comercializador = c.id_comercializadores
  JOIN personas AS p ON ca.id_persona = p.id_persona`;
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
  const query = `
    INSERT INTO centros_apuesta (id_comercializador, id_persona,nombre_agencia,direccion,estado)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING *;
  `;
  const values = [
    data.id_comercializador, 
    data.id_persona,         
    data.nombre_agencia,     
    data.direccion,          
    data.estado || 'activo', 
  ];
  const result = await pool.query(query, values);
  return result.rows[0]; 
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

  if (fields.length === 0) return [];

  const query = `
    UPDATE centros_apuesta SET ${fields.join(", ")}
    WHERE id_centro = $${i} RETURNING *`;
  values.push(id);
  const result = await pool.query(query, values);
  return result.rows;
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

// Detalle completo: datos del centro + sus representantes activos
export const get_centro_detalle_completo = async (id) => {
  // Datos del centro y su dueño/titular
  const centroQuery = `
  SELECT ca.id_centro, ca.id_comercializador, ca.nombre_agencia, ca.direccion, ca.estado,
         p.id_persona, p.ci_rif, p.razon_social
  FROM centros_apuesta AS ca
  JOIN personas AS p ON ca.id_persona = p.id_persona
  WHERE ca.id_centro = $1
  `;
  const centroResult = await pool.query(centroQuery, [id]);
  if (!centroResult.rows[0]) return null;

  const centro = centroResult.rows[0];

  // Representantes activos adicionales del centro
  const repQuery = `
  SELECT car.id_ca_representante, car.id_persona, car.cargo, car.estado,
         p.razon_social, p.ci_rif, p.telefono, p.email
  FROM centros_apuesta_representantes AS car
  JOIN personas AS p ON car.id_persona = p.id_persona
  WHERE car.id_centro = $1 AND car.estado = 'activo'
  ORDER BY p.razon_social
  `;
  const repResult = await pool.query(repQuery, [id]);

  const titular = {
    id_persona: centro.id_persona,
    ci_rif: centro.ci_rif,
    razon_social: centro.razon_social,
    cargo: 'Dueño / Titular'
  };

  return {
    ...centro,
    representantes: [titular, ...repResult.rows],
  };
};
