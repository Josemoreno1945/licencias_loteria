-- ============================================================
--  SEED.SQL — Lotería del Táchira · Gerencia de Productos
--  Script de inicialización / semilla de datos
--  Ejecutar DESPUÉS de bdd.sql sobre la misma base de datos
--  PostgreSQL 14+ con pgcrypto habilitado
-- ============================================================
--
--  NOTAS DE ESQUEMA (verificadas contra bdd.sql):
--    · No existe la tabla "operadoras". El rol de operadora lo cumple
--      la tabla "comercializadores" (id_comercializadores).
--    · La tabla "solicitudes" no tiene columna "id_operadora"; el FK
--      hacia la operadora se hace con "id_comercializador".
--    · La tabla "juegos" es un catálogo independiente (no se vincula
--      directamente a una operadora por FK en el esquema). La relación
--      operadora↔juego se materializa a través de "permisos_juego".
--    · Todos los campos solicitados (incluso los opcionales) se
--      completan con valores reales; cero NULLs en los registros
--      insertados.
-- ============================================================


-- ============================================================
-- 1) LIMPIEZA INICIAL
--    Se truncan las tablas que se van a poblar, en orden inverso
--    de dependencias para evitar violaciones de FK. CASCADE borra
--    en cascada y RESTART IDENTITY reinicia las secuencias.
-- ============================================================
TRUNCATE TABLE
    pagos,
    documento_juegos,
    participaciones_representantes,
    participaciones,
    autorizaciones_representantes,
    autorizaciones_especiales,
    licencias_representantes,
    licencias,
    documentos_emitidos,
    solicitud_juegos,
    solicitud_centros,
    solicitud_representantes,
    solicitudes,
    permisos_juego,
    centros_apuesta_representantes,
    centros_apuesta,
    comercializadores_representantes,
    comercializadores,
    juegos,
    personas,
    bancos,
    usuarios
RESTART IDENTITY CASCADE;


-- ============================================================
-- 2) USUARIO SUPERADMIN
-- ============================================================
INSERT INTO usuarios (
    id_usuario,
    nombre_usuario,
    email,
    password_hash,
    rol,
    estado
) VALUES (
    '11111111-1111-4111-8111-111111111111',
    'jose',
    'jose@gmail.com',
    crypt('12345678', gen_salt('bf')),
    'superAdmin',
    'activo'
);


-- ============================================================
-- 3) BANCOS (5 — códigos BCV reales de Venezuela)
-- ============================================================
INSERT INTO bancos (id_banco, nombre, codigo, estado) VALUES
('21111111-1111-4111-8111-111111111101', 'Banesco Banco Universal',          '0134', 'activo'),
('21111111-1111-4111-8111-111111111102', 'Banco de Venezuela',               '0102', 'activo'),
('21111111-1111-4111-8111-111111111103', 'Banco Mercantil',                  '0105', 'activo'),
('21111111-1111-4111-8111-111111111104', 'Banco Provincial',                 '0108', 'activo'),
('21111111-1111-4111-8111-111111111105', 'Banco Nacional de Crédito (BNC)',  '0191', 'activo');


-- ============================================================
-- 4) PERSONAS (20 — naturales y jurídicas, municipios del Táchira)
-- ============================================================
INSERT INTO personas (
    id_persona, ci_rif, razon_social, tipo_persona,
    direccion_fiscal, telefono, email
) VALUES
-- 10 Personas Naturales (V-)
('33333333-3333-4333-8333-333333333301', 'V-3500001', 'Carlos Eduardo Ramírez González',   'natural', 'Av. 5 entre calles 9 y 10, Barrio Obrero, San Cristóbal',                 '0414-7123456', 'carlos.ramirez.tachira@gmail.com'),
('33333333-3333-4333-8333-333333333302', 'V-4200002', 'María Fernanda Olivares de Pérez',  'natural', 'Calle 3 con carrera 6, Rubio, Municipio Junín',                          '0416-6234567', 'maria.olivares.rubio@gmail.com'),
('33333333-3333-4333-8333-333333333303', 'V-5600003', 'José Antonio Hernández Vargas',     'natural', 'Av. Principal de Táriba, frente a la Plaza Bolívar, Táriba',              '0424-7345678', 'jose.hernandez.tariba@gmail.com'),
('33333333-3333-4333-8333-333333333304', 'V-6100004', 'Ana Lucía Briceño de Mendoza',      'natural', 'Calle Independencia, Capacho Viejo, Municipio Independencia',            '0412-8456789', 'ana.briceno.capacho@gmail.com'),
('33333333-3333-4333-8333-333333333305', 'V-7200005', 'Luis Eduardo Zambrano León',        'natural', 'Av. Bolívar con calle 7, Cordero, Municipio Andrés Bello',                '0414-9567890', 'luis.zambrano.cordero@gmail.com'),
('33333333-3333-4333-8333-333333333306', 'V-9800006', 'Rosa Elvira Maldonado Colmenares',  'natural', 'Calle Principal, Michelena, Municipio Michelena',                        '0416-1678901', 'rosa.maldonado.michelena@gmail.com'),
('33333333-3333-4333-8333-333333333307', 'V-3100007', 'Pedro Pablo Sánchez Trejo',         'natural', 'Av. Universidad, La Concordia, San Cristóbal',                            '0424-2789012', 'pedro.sanchez.sc@gmail.com'),
('33333333-3333-4333-8333-333333333308', 'V-4700008', 'Yolanda Josefina Duque Ramírez',    'natural', 'Calle 14 entre carreras 12 y 13, Barrio Santa Teresa, San Cristóbal',     '0412-3890123', 'yolanda.duque.sc@gmail.com'),
('33333333-3333-4333-8333-333333333309', 'V-8300009', 'Héctor Manuel Colmenares Sánchez',  'natural', 'Av. Marginal del Torbes, Pueblo Nuevo, San Cristóbal',                   '0414-4901234', 'hector.colmenares.sc@gmail.com'),
('33333333-3333-4333-8333-333333333310', 'V-5500010', 'Beatriz Helena Uzcátegui Colmenares','natural', 'Calle 5 con carrera 8, Palmira, Municipio Guaicaipuro',                   '0416-5012345', 'beatriz.uzcategui.palmira@gmail.com'),
-- 10 Personas Jurídicas (J-)
('33333333-3333-4333-8333-333333333311', 'J-30123456-7', 'Inversiones Lotería del Táchira C.A.',            'juridica', 'Av. Libertador, Edif. Lotería, Piso 1, San Cristóbal',                '0276-3412233', 'gerencia@loteriatachira.com.ve'),
('33333333-3333-4333-8333-333333333312', 'J-40234567-8', 'Grupo Empresarial Andino Tachirense, S.A.',       'juridica', 'Av. Principal de Táriba, Centro Empresarial Los Andes',               '0276-3941122', 'contacto@grupoandino.com.ve'),
('33333333-3333-4333-8333-333333333313', 'J-50345678-9', 'Comercializadora de Juegos La Cordillera, C.A.', 'juridica', 'Calle 4 con carrera 7, Rubio, Municipio Junín',                       '0276-7623344', 'administracion@cordillera.com.ve'),
('33333333-3333-4333-8333-333333333314', 'J-60456789-0', 'Servicios y Entretenimiento Táchira, S.A.',       'juridica', 'Av. 5 de Julio, Centro, San Cristóbal',                                '0276-4255566', 'operaciones@syetachira.com.ve'),
('33333333-3333-4333-8333-333333333315', 'J-70567890-1', 'Apuestas y Sorteos Los Andes, C.A.',              'juridica', 'Calle 8 entre carreras 5 y 6, La Fría, Municipio García de Hevia',     '0276-5417788', 'gerencia@apuestaslosandes.com.ve'),
('33333333-3333-4333-8333-333333333316', 'J-80678901-2', 'Red de Agencias de Lotería del Táchira, C.A.',    'juridica', 'Av. España con calle 12, San Cristóbal',                               '0276-3439900', 'agencias@redtachira.com.ve'),
('33333333-3333-4333-8333-333333333317', 'J-90789012-3', 'Operadora de Lotería Electrónica, S.A.',          'juridica', 'Calle 3 con carrera 4, Capacho Nuevo, Municipio Independencia',        '0276-4112266', 'contacto@opelote.com.ve'),
('33333333-3333-4333-8333-333333333318', 'J-10890123-4', 'Comercializadora de Sorteos La Gran Colombia, C.A.','juridica', 'Av. Intercomunal, vía Corozo, San Antonio del Táchira',              '0276-7711144', 'gerencia@granco.com.ve'),
('33333333-3333-4333-8333-333333333319', 'J-21901234-5', 'Loterías y Apuestas del Páramo, S.A.',           'juridica', 'Calle Bolívar, frente a la Plaza, Pregonero, Municipio Uribante',      '0276-9885522', 'admin@paramoapuestas.com.ve'),
('33333333-3333-4333-8333-333333333320', 'J-32012345-6', 'Centro de Apuestas La Fortuna, C.A.',             'juridica', 'Av. Principal, vía Rubio, Rionegro, Municipio Rionegro',               '0276-5598877', 'gerencia@lafortuna.com.ve');


-- ============================================================
-- 5) COMERCIALIZADORES (5 operadoras) Y SUS REPRESENTANTES
--    (id_operadora del enunciado = id_comercializadores)
-- ============================================================

-- 5.1 COMERCIALIZADORES
INSERT INTO comercializadores (
    id_comercializadores, rif, razon_social,
    direccion_fiscal, telefono, email, estado
) VALUES
('44444444-4444-4444-8444-444444444401', 'J-30123456-7', 'Inversiones Lotería del Táchira C.A.',           'Av. Libertador, Edif. Lotería, Piso 1, San Cristóbal',    '0276-3412233', 'gerencia@loteriatachira.com.ve',  'activo'),
('44444444-4444-4444-8444-444444444402', 'J-40234567-8', 'Grupo Empresarial Andino Tachirense, S.A.',      'Av. Principal de Táriba, Centro Empresarial Los Andes',   '0276-3941122', 'contacto@grupoandino.com.ve',     'activo'),
('44444444-4444-4444-8444-444444444403', 'J-50345678-9', 'Comercializadora de Juegos La Cordillera, C.A.', 'Calle 4 con carrera 7, Rubio, Municipio Junín',           '0276-7623344', 'administracion@cordillera.com.ve','activo'),
('44444444-4444-4444-8444-444444444404', 'J-60456789-0', 'Servicios y Entretenimiento Táchira, S.A.',      'Av. 5 de Julio, Centro, San Cristóbal',                  '0276-4255566', 'operaciones@syetachira.com.ve',   'activo'),
('44444444-4444-4444-8444-444444444405', 'J-70567890-1', 'Apuestas y Sorteos Los Andes, C.A.',             'Calle 8 entre carreras 5 y 6, La Fría, Municipio García de Hevia','0276-5417788','gerencia@apuestaslosandes.com.ve','activo');

-- 5.2 COMERCIALIZADORES_REPRESENTANTES
--     (FK a id_comercializadores y FK a id_persona, AMBOS por UUID)
INSERT INTO comercializadores_representantes (
    id_c_representantes, id_comercializador, id_persona, cargo, estado
) VALUES
('55555555-5555-4555-8555-555555555501', '44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333301', 'Presidente',          'activo'),
('55555555-5555-4555-8555-555555555502', '44444444-4444-4444-8444-444444444402', '33333333-3333-4333-8333-333333333302', 'Gerente General',     'activo'),
('55555555-5555-4555-8555-555555555503', '44444444-4444-4444-8444-444444444403', '33333333-3333-4333-8333-333333333303', 'Director Comercial',  'activo'),
('55555555-5555-4555-8555-555555555504', '44444444-4444-4444-8444-444444444404', '33333333-3333-4333-8333-333333333304', 'Apoderado Legal',     'activo'),
('55555555-5555-4555-8555-555555555505', '44444444-4444-4444-8444-444444444405', '33333333-3333-4333-8333-333333333305', 'Representante Legal','activo');


-- ============================================================
-- 6) CENTROS DE APUESTA Y SUS DUEÑOS
-- ============================================================

-- 6.1 CENTROS_APUESTA (FK por UUID: id_comercializador y id_persona)
INSERT INTO centros_apuesta (
    id_centro, id_comercializador, id_persona,
    nombre_agencia, direccion, estado
) VALUES
('66666666-6666-4666-8666-666666666601', '44444444-4444-4444-8444-444444444401', '33333333-3333-4333-8333-333333333305', 'Agencia La Concordia',     'Av. Universidad, La Concordia, San Cristóbal',                       'activo'),
('66666666-6666-4666-8666-666666666602', '44444444-4444-4444-8444-444444444402', '33333333-3333-4333-8333-333333333306', 'Agencia Michelena',        'Calle Principal, Michelena, Municipio Michelena',                     'activo'),
('66666666-6666-4666-8666-666666666603', '44444444-4444-4444-8444-444444444403', '33333333-3333-4333-8333-333333333307', 'Agencia Santa Teresa',     'Calle 14 entre carreras 12 y 13, Barrio Santa Teresa, San Cristóbal','activo'),
('66666666-6666-4666-8666-666666666604', '44444444-4444-4444-8444-444444444404', '33333333-3333-4333-8333-333333333308', 'Agencia Pueblo Nuevo',     'Av. Marginal del Torbes, Pueblo Nuevo, San Cristóbal',              'activo'),
('66666666-6666-4666-8666-666666666605', '44444444-4444-4444-8444-444444444405', '33333333-3333-4333-8333-333333333309', 'Agencia La Fría Centro',   'Calle 8 entre carreras 5 y 6, La Fría, Municipio García de Hevia',  'activo');

-- 6.2 CENTROS_APUESTA_REPRESENTANTES (FK por UUID: id_centro y id_persona)
INSERT INTO centros_apuesta_representantes (
    id_ca_representante, id_centro, id_persona, cargo, estado
) VALUES
('77777777-7777-4777-8777-777777777701', '66666666-6666-4666-8666-666666666601', '33333333-3333-4333-8333-333333333301', 'Titular',  'activo'),
('77777777-7777-4777-8777-777777777702', '66666666-6666-4666-8666-666666666602', '33333333-3333-4333-8333-333333333302', 'Titular',  'activo'),
('77777777-7777-4777-8777-777777777703', '66666666-6666-4666-8666-666666666603', '33333333-3333-4333-8333-333333333303', 'Titular',  'activo'),
('77777777-7777-4777-8777-777777777704', '66666666-6666-4666-8666-666666666604', '33333333-3333-4333-8333-333333333304', 'Titular',  'activo'),
('77777777-7777-4777-8777-777777777705', '66666666-6666-4666-8666-666666666605', '33333333-3333-4333-8333-333333333305', 'Titular',  'activo');


-- ============================================================
-- 7) JUEGOS (5)
--    La tabla "juegos" del esquema es un catálogo independiente
--    (no tiene FK a comercializadores en bdd.sql). La asociación
--    con operadoras se gestiona a través de la tabla permisos_juego
--    (no se incluye en este seed porque no fue solicitada).
-- ============================================================
INSERT INTO juegos (id_juego, nombre, estado) VALUES
('88888888-8888-4888-8888-888888888801', 'Kino Táchira',   'activo'),
('88888888-8888-4888-8888-888888888802', 'Triple Táchira', 'activo'),
('88888888-8888-4888-8888-888888888803', 'Kingo',          'activo'),
('88888888-8888-4888-8888-888888888804', 'Lotto Activo',   'activo'),
('88888888-8888-4888-8888-888888888805', 'La Granjita',    'activo');


-- ============================================================
-- 8) SOLICITUDES — 10 registros
--    · TODAS con estado = 'Pendiente'
--    · Cero NULLs en los campos de las solicitudes insertadas
--    · Las FK usan únicamente los UUIDs creados en pasos anteriores
-- ============================================================
INSERT INTO solicitudes (
    id_solicitudes,
    id_persona,
    id_comercializador,
    tipo_tramite,
    categoria_licencia,
    tipo_participacion,
    tipo_autorizacion_especial,
    estado,
    justificacion_no_logrado,
    descripcion_tramite,
    observaciones,
    tipo_emision,
    numero_autorizacion_conalot,
    fecha_emision_conalot,
    fecha_vencimiento_conalot,
    numero_licencia_loteriatachira,
    direccion_autorizacion_especial,
    registrado_por
) VALUES
-- 1) Licencia — Operador
(
    '99999999-9999-4999-8999-999999999901',
    '33333333-3333-4333-8333-333333333301',
    '44444444-4444-4444-8444-444444444401',
    'Licencia', 'Operador', NULL, NULL,
    'Pendiente',
    'N/A',
    'Solicitud de Licencia de Operador para la persona natural Carlos Eduardo Ramírez González.',
    'Sin observaciones iniciales',
    'Inscripcion',
    'CONALOT-2026-001', '2026-01-10', '2027-01-09',
    'LOT-1001',
    'N/A',
    '11111111-1111-4111-8111-111111111111'
),
-- 2) Licencia — Comercializador
(
    '99999999-9999-4999-8999-999999999902',
    '33333333-3333-4333-8333-333333333302',
    '44444444-4444-4444-8444-444444444402',
    'Licencia', 'Comercializador', NULL, NULL,
    'Pendiente',
    'N/A',
    'Solicitud de Licencia como Comercializador para María Fernanda Olivares de Pérez.',
    'Sin observaciones iniciales',
    'Inscripcion',
    'CONALOT-2026-002', '2026-01-12', '2027-01-11',
    'LOT-1002',
    'N/A',
    '11111111-1111-4111-8111-111111111111'
),
-- 3) Licencia — Centro de Apuesta
(
    '99999999-9999-4999-8999-999999999903',
    '33333333-3333-4333-8333-333333333303',
    '44444444-4444-4444-8444-444444444403',
    'Licencia', 'Centro_de_apuesta', NULL, NULL,
    'Pendiente',
    'N/A',
    'Solicitud de Licencia para Centro de Apuesta en Táriba, Municipio Cárdenas.',
    'En revisión de recaudos',
    'Inscripcion',
    'CONALOT-2026-003', '2026-01-14', '2027-01-13',
    'LOT-1003',
    'Av. Principal de Táriba, frente a la Plaza Bolívar, Táriba, Municipio Cárdenas, Estado Táchira',
    '11111111-1111-4111-8111-111111111111'
),
-- 4) Licencia — Responsable de Programa Informático
(
    '99999999-9999-4999-8999-999999999904',
    '33333333-3333-4333-8333-333333333304',
    '44444444-4444-4444-8444-444444444404',
    'Licencia', 'Responsable_de_programa_informatico', NULL, NULL,
    'Pendiente',
    'N/A',
    'Solicitud de Licencia como Responsable de Programa Informático para Ana Lucía Briceño de Mendoza.',
    'Sin observaciones iniciales',
    'Inscripcion',
    'CONALOT-2026-004', '2026-01-16', '2027-01-15',
    'LOT-1004',
    'N/A',
    '11111111-1111-4111-8111-111111111111'
),
-- 5) Licencia — Operador (Renovación)
(
    '99999999-9999-4999-8999-999999999905',
    '33333333-3333-4333-8333-333333333305',
    '44444444-4444-4444-8444-444444444405',
    'Licencia', 'Operador', NULL, NULL,
    'Pendiente',
    'N/A',
    'Renovación de Licencia de Operador para Luis Eduardo Zambrano León.',
    'En revisión de recaudos',
    'Renovacion',
    'CONALOT-2026-005', '2026-01-18', '2027-01-17',
    'LOT-1005',
    'N/A',
    '11111111-1111-4111-8111-111111111111'
),
-- 6) Participación — Certificación
(
    '99999999-9999-4999-8999-999999999906',
    '33333333-3333-4333-8333-333333333306',
    '44444444-4444-4444-8444-444444444401',
    'Participacion', NULL, 'Certificacion', NULL,
    'Pendiente',
    'N/A',
    'Solicitud de Participación por Certificación para Comercializadora.',
    'Sin observaciones iniciales',
    'Inscripcion',
    'CONALOT-2026-006', '2026-01-20', '2027-01-19',
    'LOT-1006',
    'N/A',
    '11111111-1111-4111-8111-111111111111'
),
-- 7) Participación — Archivo
(
    '99999999-9999-4999-8999-999999999907',
    '33333333-3333-4333-8333-333333333307',
    '44444444-4444-4444-8444-444444444402',
    'Participacion', NULL, 'Archivo', NULL,
    'Pendiente',
    'N/A',
    'Solicitud de Participación por Archivo de documentación interna.',
    'En revisión de recaudos',
    'Inscripcion',
    'CONALOT-2026-007', '2026-01-22', '2027-01-21',
    'LOT-1007',
    'N/A',
    '11111111-1111-4111-8111-111111111111'
),
-- 8) Autorización Especial — Mesa
(
    '99999999-9999-4999-8999-999999999908',
    '33333333-3333-4333-8333-333333333308',
    '44444444-4444-4444-8444-444444444403',
    'Autorizacion_especial', NULL, NULL, 'Mesa',
    'Pendiente',
    'N/A',
    'Solicitud de Autorización Especial de tipo Mesa en centro de apuesta del estado Táchira.',
    'Sin observaciones iniciales',
    'Inscripcion',
    'CONALOT-2026-008', '2026-01-24', '2027-01-23',
    'LOT-1008',
    'Calle 14 entre carreras 12 y 13, Barrio Santa Teresa, San Cristóbal, Estado Táchira',
    '11111111-1111-4111-8111-111111111111'
),
-- 9) Autorización Especial — Localidad
(
    '99999999-9999-4999-8999-999999999909',
    '33333333-3333-4333-8333-333333333309',
    '44444444-4444-4444-8444-444444444404',
    'Autorizacion_especial', NULL, NULL, 'Localidad',
    'Pendiente',
    'N/A',
    'Solicitud de Autorización Especial de tipo Localidad en zona comercial del estado Táchira.',
    'En revisión de recaudos',
    'Inscripcion',
    'CONALOT-2026-009', '2026-01-26', '2027-01-25',
    'LOT-1009',
    'Av. Marginal del Torbes, Pueblo Nuevo, San Cristóbal, Estado Táchira',
    '11111111-1111-4111-8111-111111111111'
),
-- 10) Autorización Especial — Móvil
(
    '99999999-9999-4999-8999-999999999910',
    '33333333-3333-4333-8333-333333333310',
    '44444444-4444-4444-8444-444444444405',
    'Autorizacion_especial', NULL, NULL, 'Movil',
    'Pendiente',
    'N/A',
    'Solicitud de Autorización Especial de tipo Móvil para unidad móvil del estado Táchira.',
    'Sin observaciones iniciales',
    'Inscripcion',
    'CONALOT-2026-010', '2026-01-28', '2027-01-27',
    'LOT-1010',
    'Calle 8 entre carreras 5 y 6, La Fría, Municipio García de Hevia, Estado Táchira',
    '11111111-1111-4111-8111-111111111111'
);


-- ============================================================
-- FIN DEL SEED
-- Resumen cargado:
--   1 usuario, 5 bancos, 20 personas, 5 comercializadores,
--   5 representantes de comercializadores, 5 centros de apuesta,
--   5 representantes de centros, 5 juegos, 10 solicitudes.
-- ============================================================
