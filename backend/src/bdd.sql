-- ------------------------------------
-- EXTENSIONES
-- ------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE tipo_persona_enum AS ENUM (
    'natural',
    'juridica'
);

CREATE TYPE estado AS ENUM (
    'activo',
    'inactivo'
);

CREATE TYPE estado_documento_enum AS ENUM (
    'vigente',
    'vencido',
    'anulado',
    'suspendido'
);

CREATE TYPE estado_solicitud AS ENUM (
    'Pendiente',
    'Aprobado',
    'Rechazada'
);

CREATE TYPE tipo_tramite_enum AS ENUM (
    'Licencia',
    'Participacion',
    'Autorizacion_especial',
    'Otro'
);

CREATE TYPE categoria_licencia_enum AS ENUM (
    'Operador',
    'Comercializador',
    'Centro_de_apuesta',
    'Responsable_de_programa_informatico'
);

CREATE TYPE tipo_documento_enum AS ENUM (
    'Licencia',
    'Participacion',
    'Autorizacion_especial'
);

CREATE TYPE tipo_emision_enum AS ENUM (
    'Inscripcion',
    'Renovacion'
);

CREATE TYPE tipo_participacion_enum AS ENUM (
    'Archivo',
    'Certificacion',
    'Rectificacion',
    'Nulidad'
);

CREATE TYPE tipo_autorizacion_especial_enum AS ENUM (
    'Movil',
    'Localidad',
    'Mesa'
);

CREATE TYPE nivel_permiso_juego_enum AS ENUM (
    'comercializador',
    'centro_apuesta'
);


-- ============================================================
-- USUARIOS
-- ============================================================

CREATE TABLE rol (
    nombre      VARCHAR(50) PRIMARY KEY,
    descripcion TEXT,
    created_at  TIMESTAMP DEFAULT now(),
    updated_at  TIMESTAMP DEFAULT now()
);

COMMENT ON TABLE rol IS 'Roles permitidos para los usuarios del sistema.';

INSERT INTO rol (nombre, descripcion) VALUES 
('superAdmin', 'Administrador supremo del sistema (Desarrollador/Soporte).'),
('gerente', 'Acceso total y administración del sistema.'),
('gestor_de_tramites', 'Encargado de la gestión y procesamiento de trámites y solicitudes.'),
('supervisor', 'Encargado de la revisión y supervisión de los procesos y trámites.');


CREATE TABLE usuarios (
    id_usuario     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_usuario VARCHAR(50)  NOT NULL,
    email          CITEXT       NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    rol            VARCHAR(50)  NOT NULL DEFAULT 'gestor_de_tramites',
    estado         estado       NOT NULL DEFAULT 'activo',
    created_at     TIMESTAMP    DEFAULT now(),
    updated_at     TIMESTAMP    DEFAULT now(),

    CONSTRAINT uq_usuarios_nombre_usuario UNIQUE (nombre_usuario),
    CONSTRAINT uq_usuarios_email          UNIQUE (email),
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (rol)
        REFERENCES rol (nombre)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE  usuarios               IS 'Usuarios del sistema (empleados y administradores).';
COMMENT ON COLUMN usuarios.email         IS 'Email insensible a mayúsculas gracias al tipo CITEXT.';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash de la contraseña; nunca se almacena en texto plano.';


-- ============================================================
-- BANCOS
-- ============================================================

CREATE TABLE bancos (
    id_banco UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre   VARCHAR(150) NOT NULL,
    codigo   VARCHAR(10),
    estado   estado       NOT NULL DEFAULT 'activo',

    CONSTRAINT uq_bancos_nombre  UNIQUE (nombre),
    CONSTRAINT uq_bancos_codigo  UNIQUE (codigo)
);

COMMENT ON TABLE  bancos        IS 'Catálogo de bancos (ej. Banco de Venezuela, código 0102).';
COMMENT ON COLUMN bancos.codigo IS 'Código BCV del banco (4 dígitos). Puede ser NULL para bancos sin código registrado.';


-- ============================================================
-- ENTIDADES PRINCIPALES
-- ============================================================

CREATE TABLE personas (
    id_persona       UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    ci_rif           VARCHAR(20)       NOT NULL,
    razon_social     VARCHAR(200)      NOT NULL,
    tipo_persona     tipo_persona_enum NOT NULL,
    direccion_fiscal TEXT,
    telefono         VARCHAR(30),
    email            CITEXT,
    created_at       TIMESTAMP         DEFAULT now(),
    updated_at       TIMESTAMP         DEFAULT now(),

    CONSTRAINT uq_personas_ci_rif UNIQUE (ci_rif),
    CONSTRAINT uq_personas_email  UNIQUE (email)
);

COMMENT ON TABLE  personas           IS 'Personas naturales o jurídicas que intervienen en trámites.';
COMMENT ON COLUMN personas.ci_rif    IS 'Cédula de identidad (persona natural) o RIF (persona jurídica).';
COMMENT ON COLUMN personas.email     IS 'Email opcional, único e insensible a mayúsculas.';

CREATE INDEX idx_personas_ci_rif      ON personas (ci_rif);
CREATE INDEX idx_personas_razon_social ON personas (razon_social);

-- -------------------------------------------------------

CREATE TABLE comercializadores (
    id_comercializadores UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    rif                  VARCHAR(20)  NOT NULL,
    razon_social         VARCHAR(200) NOT NULL,
    direccion_fiscal     TEXT,
    telefono             VARCHAR(30),
    email                CITEXT,
    estado               estado       NOT NULL DEFAULT 'activo',
    created_at           TIMESTAMP    DEFAULT now(),
    updated_at           TIMESTAMP    DEFAULT now(),

    CONSTRAINT uq_comercializadores_rif   UNIQUE (rif),
    CONSTRAINT uq_comercializadores_email UNIQUE (email)
);

COMMENT ON TABLE  comercializadores IS 'Empresas o personas autorizadas a comercializar juegos de azar.';
COMMENT ON COLUMN comercializadores.email IS 'Email opcional único; NULL si no aplica.';

CREATE INDEX idx_comercializadores_rif    ON comercializadores (rif);
CREATE INDEX idx_comercializadores_estado ON comercializadores (estado);

-- -------------------------------------------------------

CREATE TABLE comercializadores_representantes (
    id_c_representantes UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comercializador  UUID   NOT NULL,
    id_persona          UUID   NOT NULL,
    cargo               VARCHAR(100),
    estado              estado NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_com_rep_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_com_rep_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_comercializador_representante
        UNIQUE (id_comercializador, id_persona)
);

COMMENT ON TABLE comercializadores_representantes IS 'Representantes legales vinculados a una comercializadora.';

-- -------------------------------------------------------

CREATE TABLE operadoras (
    id_operadora     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    rif              VARCHAR(20)  NOT NULL,
    razon_social     VARCHAR(200) NOT NULL,
    direccion_fiscal TEXT,
    estado           estado       NOT NULL DEFAULT 'activo',
    created_at       TIMESTAMP    DEFAULT now(),
    updated_at       TIMESTAMP    DEFAULT now(),

    CONSTRAINT uq_operadoras_rif UNIQUE (rif)
);

COMMENT ON TABLE operadoras IS 'Operadoras: empresas propietarias de los juegos de azar.';

CREATE INDEX idx_operadoras_rif ON operadoras (rif);

-- -------------------------------------------------------

CREATE TABLE centros_apuesta (
    id_centro          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_comercializador UUID         NOT NULL,
    id_persona         UUID         NOT NULL,
    nombre_agencia     VARCHAR(200) NOT NULL,
    direccion          TEXT         NOT NULL,
    estado             estado       NOT NULL DEFAULT 'activo',
    created_at         TIMESTAMP    DEFAULT now(),
    updated_at         TIMESTAMP    DEFAULT now(),

    CONSTRAINT fk_centro_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_centro_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE  centros_apuesta           IS 'Agencias físicas (puntos de venta) vinculadas a un comercializador.';
COMMENT ON COLUMN centros_apuesta.id_persona IS 'Encargado o dueño local del centro de apuesta.';

CREATE INDEX idx_centros_nombre          ON centros_apuesta (nombre_agencia);
CREATE INDEX idx_centros_comercializador ON centros_apuesta (id_comercializador);

-- -------------------------------------------------------

CREATE TABLE centros_apuesta_representantes (
    id_ca_representante UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    id_centro           UUID     NOT NULL,
    id_persona          UUID     NOT NULL,
    cargo               VARCHAR(100),
    estado              estado   NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_car_centro
        FOREIGN KEY (id_centro)
        REFERENCES centros_apuesta (id_centro)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_car_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_centro_representante
        UNIQUE (id_centro, id_persona)
);

COMMENT ON TABLE  centros_apuesta_representantes      IS 'Representantes legales vinculados a un centro de apuesta (pueden ser varios).';
COMMENT ON COLUMN centros_apuesta_representantes.cargo IS 'Cargo del representante dentro del centro (ej. Gerente, Apoderado).';

CREATE INDEX idx_centros_representantes_centro   ON centros_apuesta_representantes (id_centro);
CREATE INDEX idx_centros_representantes_persona  ON centros_apuesta_representantes (id_persona);


-- ============================================================
-- JERARQUÍA DE PERMISOS DE JUEGO
-- ============================================================

CREATE TABLE juegos (
    id_juego     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_operadora UUID         NOT NULL,
    nombre       VARCHAR(100) NOT NULL,
    estado       estado       NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_juego_operadora
        FOREIGN KEY (id_operadora)
        REFERENCES operadoras (id_operadora)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_juegos_nombre UNIQUE (nombre)
);

COMMENT ON TABLE juegos IS 'Catálogo de juegos; cada juego pertenece a una operadora.';

-- -------------------------------------------------------

CREATE TABLE permisos_juego (
    id_permiso_juego   UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
    id_juego           UUID                     NOT NULL,
    id_comercializador UUID,                    -- NULL si es permiso para un centro
    id_centro          UUID,                    -- NULL si es permiso para comercializador
    nivel              nivel_permiso_juego_enum NOT NULL,
    estado             estado                   NOT NULL DEFAULT 'activo',
    fecha_inicio       DATE                     NOT NULL,
    fecha_fin          DATE,                    -- NULL = sin vencimiento

    CONSTRAINT fk_permiso_juego
        FOREIGN KEY (id_juego)
        REFERENCES juegos (id_juego)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_permiso_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_permiso_centro
        FOREIGN KEY (id_centro)
        REFERENCES centros_apuesta (id_centro)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_permiso_comercializador
        UNIQUE (id_juego, id_comercializador, nivel),

    CONSTRAINT uq_permiso_centro
        UNIQUE (id_juego, id_centro, nivel),

    CONSTRAINT ck_permiso_nivel_xor CHECK (
        (id_comercializador IS NOT NULL AND id_centro IS NULL AND nivel = 'comercializador') OR
        (id_centro IS NOT NULL AND id_comercializador IS NULL AND nivel = 'centro_apuesta')
    )
);

COMMENT ON TABLE  permisos_juego IS
    'Jerarquía de permisos: Nivel 1 = Operadora→Comercializador, Nivel 2 = Comercializador→Centro.';
COMMENT ON COLUMN permisos_juego.fecha_fin IS 'NULL indica permiso sin fecha de vencimiento.';


-- ============================================================
-- TRÁMITES / SOLICITUDES
-- ============================================================

CREATE TABLE solicitudes (
    id_solicitudes     UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_persona         UUID                    NOT NULL,
    id_comercializador UUID,
    id_operadora       UUID,
    tipo_tramite       tipo_tramite_enum       NOT NULL,
    categoria_licencia categoria_licencia_enum,
    estado             estado_solicitud        NOT NULL DEFAULT 'Pendiente',
    justificacion_no_logrado TEXT,
    descripcion_tramite      TEXT,
    observaciones            TEXT,
    tipo_emision             tipo_emision_enum,          -- Inscripcion/Renovacion (aplica en Licencia)
    numero_autorizacion_conalot VARCHAR(50),             -- Nro CONALOT (aplica en Participacion)
    fecha_emision_conalot    DATE,                       -- Fecha emision CONALOT (aplica en Participacion)
    fecha_vencimiento_conalot DATE,                      -- Fecha vencimiento CONALOT (aplica en Participacion)
    numero_licencia_loteriatachira VARCHAR(100),         -- N° de Licencia emitida por Loteria (aplica en Participacion)
    direccion_autorizacion_especial TEXT,                -- Direccion de la Mesa/Localidad (aplica en Autorizacion Especial)
    registrado_por     UUID                    NOT NULL,
    created_at         TIMESTAMP               DEFAULT now(),
    updated_at         TIMESTAMP               DEFAULT now(),

    CONSTRAINT fk_solicitud_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_solicitud_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_solicitud_operadora
        FOREIGN KEY (id_operadora)
        REFERENCES operadoras (id_operadora)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_solicitud_registrado_por
        FOREIGN KEY (registrado_por)
        REFERENCES usuarios (id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Justificación obligatoria cuando se rechaza
    CONSTRAINT ck_solicitud_justificacion CHECK (
        estado <> 'Rechazada' OR justificacion_no_logrado IS NOT NULL
    )
);

COMMENT ON TABLE  solicitudes                      IS 'Trámites iniciados por personas o comercializadores ante la institución.';
COMMENT ON COLUMN solicitudes.id_operadora         IS 'v2.0: Nullable; aplica en Autorizaciones Especiales vinculadas directamente a la operadora.';
COMMENT ON COLUMN solicitudes.categoria_licencia   IS 'Solo aplica cuando tipo_tramite = ''Licencia''.';
COMMENT ON COLUMN solicitudes.justificacion_no_logrado IS 'Obligatorio a nivel de aplicación cuando estado = ''Rechazada''.';

CREATE INDEX idx_solicitudes_tipo           ON solicitudes (tipo_tramite);
CREATE INDEX idx_solicitudes_estado         ON solicitudes (estado);
CREATE INDEX idx_solicitudes_persona        ON solicitudes (id_persona);
CREATE INDEX idx_solicitudes_registrado_por ON solicitudes (registrado_por);
CREATE INDEX idx_solicitudes_conalot        ON solicitudes (numero_autorizacion_conalot);

-- -------------------------------------------------------
-- TABLAS PUENTE DE SOLICITUDES (N:M)
-- -------------------------------------------------------

CREATE TABLE solicitud_representantes (
    id_solicitud_representante UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_solicitud               UUID    NOT NULL,
    id_persona                 UUID    NOT NULL,
    rol                        VARCHAR(30) NOT NULL,   -- 'comercializador' | 'centro' | 'legal'
    cargo                      VARCHAR(100),
    estado                     estado  NOT NULL DEFAULT 'activo',

    CONSTRAINT fk_sr_solicitud
        FOREIGN KEY (id_solicitud)
        REFERENCES solicitudes (id_solicitudes)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_sr_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_solicitud_representante
        UNIQUE (id_solicitud, id_persona, rol)
);

COMMENT ON TABLE  solicitud_representantes IS 'Representantes legales vinculados a una solicitud (varios por rol).';
COMMENT ON COLUMN solicitud_representantes.rol IS 'Rol del representante: comercializador, centro o legal.';

CREATE INDEX idx_sol_rep_solicitud ON solicitud_representantes (id_solicitud);
CREATE INDEX idx_sol_rep_persona   ON solicitud_representantes (id_persona);

-- -------------------------------------------------------

CREATE TABLE solicitud_centros (
    id_solicitud_centro UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_solicitud        UUID NOT NULL,
    id_centro           UUID NOT NULL,

    CONSTRAINT fk_sc_solicitud
        FOREIGN KEY (id_solicitud)
        REFERENCES solicitudes (id_solicitudes)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_sc_centro
        FOREIGN KEY (id_centro)
        REFERENCES centros_apuesta (id_centro)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_solicitud_centro UNIQUE (id_solicitud, id_centro)
);

COMMENT ON TABLE solicitud_centros IS 'Centros de apuesta vinculados a una solicitud (varios).';

CREATE INDEX idx_sol_centro_solicitud ON solicitud_centros (id_solicitud);
CREATE INDEX idx_sol_centro_centro    ON solicitud_centros (id_centro);

-- -------------------------------------------------------

CREATE TABLE solicitud_juegos (
    id_solicitud_juego UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_solicitud       UUID NOT NULL,
    id_juego           UUID NOT NULL,

    CONSTRAINT fk_sj_solicitud
        FOREIGN KEY (id_solicitud)
        REFERENCES solicitudes (id_solicitudes)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_sj_juego
        FOREIGN KEY (id_juego)
        REFERENCES juegos (id_juego)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_solicitud_juego UNIQUE (id_solicitud, id_juego)
);

COMMENT ON TABLE solicitud_juegos IS 'Juegos solicitados dentro de una solicitud (relación N:M).';

CREATE INDEX idx_sol_juego_solicitud ON solicitud_juegos (id_solicitud);
CREATE INDEX idx_sol_juego_juego     ON solicitud_juegos (id_juego);


-- ============================================================
-- DOCUMENTOS EMITIDOS (TABLA PARAGUAS)
-- ============================================================

CREATE TABLE documentos_emitidos (
    id_documento          UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
    id_solicitud          UUID                  NOT NULL,
    tipo                  tipo_documento_enum   NOT NULL,
    tipo_emision          tipo_emision_enum     NOT NULL DEFAULT 'Inscripcion',
    id_documento_anterior UUID,
    numero_documento      VARCHAR(30)           NOT NULL,
    papel_seguridad       VARCHAR(30)           NOT NULL,
    estado_documento      estado_documento_enum NOT NULL DEFAULT 'vigente',
    fecha_expedicion      DATE                  NOT NULL,
    fecha_vencimiento     DATE                  NOT NULL,
    direccion_establecimiento TEXT,
    detalles_extra        JSONB,
    observaciones         TEXT,
    emitido_por           UUID                  NOT NULL,
    created_at            TIMESTAMP             DEFAULT now(),
    updated_at            TIMESTAMP             DEFAULT now(),

    -- Integridad referencial
    CONSTRAINT fk_doc_solicitud
        FOREIGN KEY (id_solicitud)
        REFERENCES solicitudes (id_solicitudes)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_doc_anterior
        FOREIGN KEY (id_documento_anterior)
        REFERENCES documentos_emitidos (id_documento)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_doc_emitido_por
        FOREIGN KEY (emitido_por)
        REFERENCES usuarios (id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Unicidad
    CONSTRAINT uq_doc_solicitud         UNIQUE (id_solicitud),
    CONSTRAINT uq_doc_numero_documento  UNIQUE (numero_documento),
    CONSTRAINT uq_doc_papel_seguridad   UNIQUE (papel_seguridad),

    -- Integridad de fechas
    CONSTRAINT ck_doc_fechas CHECK (fecha_vencimiento >= fecha_expedicion),

    -- Si es renovación, debe referenciar el documento anterior
    CONSTRAINT ck_doc_renovacion CHECK (
        tipo_emision <> 'Renovacion' OR id_documento_anterior IS NOT NULL
    )
);

COMMENT ON TABLE  documentos_emitidos IS
    'Tabla paraguas. Contiene los campos comunes a Licencias, Participaciones y Autorizaciones Especiales.';
COMMENT ON COLUMN documentos_emitidos.id_documento_anterior IS
    'NULL si tipo_emision = ''Inscripcion''; obligatorio si tipo_emision = ''Renovacion''.';
COMMENT ON COLUMN documentos_emitidos.fecha_vencimiento IS
    'Regla de negocio: fecha_expedicion + 365 días (calculado por la aplicación).';
COMMENT ON COLUMN documentos_emitidos.detalles_extra IS
    'JSONB libre para campos específicos del trámite "Otro".';

-- Índices simples
CREATE INDEX idx_doc_numero           ON documentos_emitidos (numero_documento);
CREATE INDEX idx_doc_papel_seguridad  ON documentos_emitidos (papel_seguridad);
CREATE INDEX idx_doc_vencimiento      ON documentos_emitidos (fecha_vencimiento);
CREATE INDEX idx_doc_estado           ON documentos_emitidos (estado_documento);
CREATE INDEX idx_doc_tipo             ON documentos_emitidos (tipo);
-- Índice compuesto para consultas de alertas de vencimiento
CREATE INDEX idx_doc_vencimiento_estado ON documentos_emitidos (fecha_vencimiento, estado_documento);

-- -------------------------------------------------------

CREATE TABLE documento_juegos (
    id_doc_juego UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_documento UUID NOT NULL,
    id_juego     UUID NOT NULL,

    CONSTRAINT fk_docjuego_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos_emitidos (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_docjuego_juego
        FOREIGN KEY (id_juego)
        REFERENCES juegos (id_juego)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_documento_juego UNIQUE (id_documento, id_juego)
);

COMMENT ON TABLE documento_juegos IS 'Juegos autorizados dentro de un documento emitido (relación N:M).';


-- ============================================================
-- TABLAS DOCUMENTALES ESPECIALIZADAS
-- Patrón: PK = FK 1:1 hacia documentos_emitidos
-- ============================================================

-- ------------------------------------------------------------
-- LICENCIAS
-- ------------------------------------------------------------

CREATE TABLE licencias (
    id_documento       UUID                    PRIMARY KEY,
    id_persona         UUID                    NOT NULL,
    id_comercializador UUID,
    id_centro          UUID,
    categoria          categoria_licencia_enum NOT NULL,
    numero_lot         VARCHAR(30),

    CONSTRAINT fk_lic_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos_emitidos (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_lic_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_lic_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_lic_centro
        FOREIGN KEY (id_centro)
        REFERENCES centros_apuesta (id_centro)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

COMMENT ON TABLE  licencias IS
    'Detalle de documentos de tipo ''Licencia''. PK = FK 1:1 con documentos_emitidos.';
COMMENT ON COLUMN licencias.id_comercializador IS
    'Nullable: no toda licencia pertenece a un comercializador.';
COMMENT ON COLUMN licencias.id_centro IS
    'Centro de apuesta específico al que aplica esta licencia.';
COMMENT ON COLUMN licencias.id_persona IS
    'Titular; razón social y dirección fiscal se obtienen por JOIN desde la solicitud (personas/comercializadores).';

CREATE INDEX idx_licencias_persona              ON licencias (id_persona);
CREATE INDEX idx_licencias_comercializador      ON licencias (id_comercializador);
CREATE INDEX idx_licencias_centro               ON licencias (id_centro);
CREATE INDEX idx_licencias_categoria            ON licencias (categoria);
CREATE INDEX idx_licencias_persona_categoria    ON licencias (id_persona, categoria);

-- -------------------------------------------------------
-- Puente: Representantes de la Licencia (N:M)
-- -------------------------------------------------------

CREATE TABLE licencias_representantes (
    id_lic_representante UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_documento         UUID    NOT NULL,
    id_persona           UUID    NOT NULL,
    rol                  VARCHAR(30),            -- 'comercializador' | 'centro' | 'legal'
    cargo                VARCHAR(100),

    CONSTRAINT fk_lr_documento
        FOREIGN KEY (id_documento)
        REFERENCES licencias (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_lr_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_licencia_representante UNIQUE (id_documento, id_persona)
);

COMMENT ON TABLE licencias_representantes IS 'Representantes legales que figuran en la licencia emitida (varios).';

CREATE INDEX idx_lic_rep_documento ON licencias_representantes (id_documento);
CREATE INDEX idx_lic_rep_persona   ON licencias_representantes (id_persona);

-- ------------------------------------------------------------
-- AUTORIZACIONES ESPECIALES
-- ------------------------------------------------------------

CREATE TABLE autorizaciones_especiales (
    id_documento              UUID                             PRIMARY KEY,
    nro_mesa                  INTEGER,                         -- Solo aplica cuando tipo = 'Mesa'
    tipo                      tipo_autorizacion_especial_enum NOT NULL DEFAULT 'Mesa',
    id_persona                UUID                             NOT NULL,
    id_operadora              UUID                             NOT NULL,
    id_comercializador        UUID,                           -- Comercializador asignado
    id_centro                 UUID,
    agencia_texto             VARCHAR(200),
    numero_lot                VARCHAR(30),
    direccion_centro_asignado TEXT,                           -- Dirección del centro de apuesta asignado
    direccion_localidad       TEXT,                           -- Dirección de la localidad (tipo Localidad)
    direccion_responsable     TEXT,                           -- Dirección del responsable
    otros                     JSONB,                          -- Campos libres ("otros")

    CONSTRAINT fk_aut_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos_emitidos (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_aut_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_aut_operadora
        FOREIGN KEY (id_operadora)
        REFERENCES operadoras (id_operadora)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_aut_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_aut_centro
        FOREIGN KEY (id_centro)
        REFERENCES centros_apuesta (id_centro)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT ck_aut_mesa_xor CHECK (
        tipo <> 'Mesa' OR nro_mesa IS NOT NULL
    )
);

COMMENT ON TABLE  autorizaciones_especiales           IS
    'Detalle de documentos de tipo ''Autorizacion_especial''. PK = FK 1:1 con documentos_emitidos.';
COMMENT ON COLUMN autorizaciones_especiales.tipo      IS
    'Catálogo: Movil, Localidad o Mesa.';
COMMENT ON COLUMN autorizaciones_especiales.nro_mesa  IS
    'Obligatorio solo cuando tipo = ''Mesa''.';
COMMENT ON COLUMN autorizaciones_especiales.id_centro IS
    'Nullable: se usa agencia_texto cuando la agencia no está catalogada.';
COMMENT ON COLUMN autorizaciones_especiales.id_comercializador IS
    'Comercializador asignado a la autorización especial.';

CREATE INDEX idx_autorizaciones_mesa              ON autorizaciones_especiales (nro_mesa);
CREATE INDEX idx_autorizaciones_persona           ON autorizaciones_especiales (id_persona);
CREATE INDEX idx_autorizaciones_operadora         ON autorizaciones_especiales (id_operadora);
CREATE INDEX idx_autorizaciones_comercializador   ON autorizaciones_especiales (id_comercializador);
CREATE INDEX idx_autorizaciones_centro            ON autorizaciones_especiales (id_centro);
CREATE INDEX idx_autorizaciones_tipo              ON autorizaciones_especiales (tipo);
CREATE INDEX idx_autorizaciones_operadora_mesa    ON autorizaciones_especiales (id_operadora, nro_mesa);

-- -------------------------------------------------------
-- Puente: Representantes de la Autorización Especial (N:M)
-- -------------------------------------------------------

CREATE TABLE autorizaciones_representantes (
    id_aut_representante UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_documento         UUID    NOT NULL,
    id_persona           UUID    NOT NULL,
    rol                  VARCHAR(30),            -- 'comercializador' | 'centro' | 'legal'
    cargo                VARCHAR(100),

    CONSTRAINT fk_ar_documento
        FOREIGN KEY (id_documento)
        REFERENCES autorizaciones_especiales (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_ar_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_autorizacion_representante UNIQUE (id_documento, id_persona)
);

COMMENT ON TABLE autorizaciones_representantes IS 'Representantes legales que figuran en la autorización especial (varios).';

CREATE INDEX idx_aut_rep_documento ON autorizaciones_representantes (id_documento);
CREATE INDEX idx_aut_rep_persona   ON autorizaciones_representantes (id_persona);

-- ------------------------------------------------------------
-- PARTICIPACIONES
-- ------------------------------------------------------------

CREATE TABLE participaciones (
    id_documento          UUID                    PRIMARY KEY,
    nro_archivo           VARCHAR(30)             NOT NULL,
    id_persona            UUID                    NOT NULL,
    id_comercializador    UUID                    NOT NULL,
    id_licencia           UUID,                   -- Licencia previa (una de las dos debe existir)
    id_autorizacion_previa UUID,                  -- Autorización especial previa (una de las dos debe existir)
    tipo                  tipo_participacion_enum NOT NULL,
    numero_lot            VARCHAR(30),
    fecha_solicitud       DATE,
    territorio            TEXT,
    observaciones         TEXT,

    CONSTRAINT fk_par_documento
        FOREIGN KEY (id_documento)
        REFERENCES documentos_emitidos (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_par_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_par_comercializador
        FOREIGN KEY (id_comercializador)
        REFERENCES comercializadores (id_comercializadores)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_par_licencia
        FOREIGN KEY (id_licencia)
        REFERENCES licencias (id_documento)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_par_autorizacion_previa
        FOREIGN KEY (id_autorizacion_previa)
        REFERENCES autorizaciones_especiales (id_documento)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT ck_par_previa_xor CHECK (
        id_licencia IS NOT NULL OR id_autorizacion_previa IS NOT NULL
    )
);

COMMENT ON TABLE  participaciones             IS
    'Detalle de documentos de tipo ''Participacion''. PK = FK 1:1 con documentos_emitidos.';
COMMENT ON COLUMN participaciones.tipo        IS
    'Catálogo: Archivo, Certificacion, Rectificacion, Nulidad.';
COMMENT ON COLUMN participaciones.id_licencia IS
    'Licencia padre que habilita esta participación (una de dos previas posibles).';
COMMENT ON COLUMN participaciones.id_autorizacion_previa IS
    'Autorización especial previa que habilita esta participación (una de dos previas posibles).';
COMMENT ON COLUMN participaciones.territorio  IS
    'Territorio de alcance de la participación según el documento físico.';
COMMENT ON COLUMN participaciones.fecha_solicitud IS
    'Fecha de solicitud según el documento físico.';

CREATE INDEX idx_participaciones_licencia             ON participaciones (id_licencia);
CREATE INDEX idx_participaciones_persona              ON participaciones (id_persona);
CREATE INDEX idx_participaciones_comercializador      ON participaciones (id_comercializador);
CREATE INDEX idx_participaciones_archivo              ON participaciones (nro_archivo);
CREATE INDEX idx_participaciones_tipo                 ON participaciones (tipo);
CREATE INDEX idx_participaciones_autorizacion_previa  ON participaciones (id_autorizacion_previa);
CREATE INDEX idx_participaciones_licencia_persona     ON participaciones (id_licencia, id_persona);

-- -------------------------------------------------------
-- Puente: Representantes de la Participación (N:M)
-- -------------------------------------------------------

CREATE TABLE participaciones_representantes (
    id_par_representante UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    id_documento         UUID    NOT NULL,
    id_persona           UUID    NOT NULL,
    rol                  VARCHAR(30),
    cargo                VARCHAR(100),

    CONSTRAINT fk_pr_documento
        FOREIGN KEY (id_documento)
        REFERENCES participaciones (id_documento)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_pr_persona
        FOREIGN KEY (id_persona)
        REFERENCES personas (id_persona)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT uq_participacion_representante UNIQUE (id_documento, id_persona)
);

COMMENT ON TABLE participaciones_representantes IS 'Representantes legales que figuran en la participación emitida (varios).';

CREATE INDEX idx_par_rep_documento ON participaciones_representantes (id_documento);
CREATE INDEX idx_par_rep_persona   ON participaciones_representantes (id_persona);


-- ============================================================
-- PAGOS
-- ============================================================

CREATE TABLE pagos (
    id_pago           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    id_banco          UUID           NOT NULL,
    num_referencia    VARCHAR(50)    NOT NULL,
    fecha_pago        DATE           NOT NULL,
    monto             DECIMAL(14, 2) NOT NULL,
    tasa_dia          DECIMAL(18, 4) NOT NULL,
    responsable_texto VARCHAR(200),
    id_licencia       UUID,
    id_autorizacion   UUID,
    id_participacion  UUID,
    observaciones     TEXT,
    registrado_por    UUID           NOT NULL,
    created_at        TIMESTAMP      DEFAULT now(),
    updated_at        TIMESTAMP      DEFAULT now(),

    CONSTRAINT fk_pago_banco
        FOREIGN KEY (id_banco)
        REFERENCES bancos (id_banco)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_pago_licencia
        FOREIGN KEY (id_licencia)
        REFERENCES licencias (id_documento)
        ON DELETE RESTRICT ON UPDATE CASCADE
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_pago_autorizacion
        FOREIGN KEY (id_autorizacion)
        REFERENCES autorizaciones_especiales (id_documento)
        ON DELETE RESTRICT ON UPDATE CASCADE
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_pago_participacion
        FOREIGN KEY (id_participacion)
        REFERENCES participaciones (id_documento)
        ON DELETE RESTRICT ON UPDATE CASCADE
        DEFERRABLE INITIALLY DEFERRED,

    CONSTRAINT fk_pago_registrado_por
        FOREIGN KEY (registrado_por)
        REFERENCES usuarios (id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- Unicidad de referencia bancaria
    CONSTRAINT uq_pagos_num_referencia UNIQUE (num_referencia),

    -- Al menos un documento debe estar vinculado al pago
    CONSTRAINT ck_pago_al_menos_un_documento CHECK (
        id_licencia IS NOT NULL OR
        id_autorizacion IS NOT NULL OR
        id_participacion IS NOT NULL
    ),

    -- Montos positivos
    CONSTRAINT ck_pago_monto_positivo   CHECK (monto   > 0),
    CONSTRAINT ck_pago_tasa_positiva    CHECK (tasa_dia > 0)
);

COMMENT ON TABLE  pagos                  IS 'Registro de pagos asociados a licencias, autorizaciones o participaciones.';
COMMENT ON COLUMN pagos.tasa_dia         IS 'Tasa BCV del día en que se realizó el pago.';
COMMENT ON COLUMN pagos.num_referencia   IS 'Número de referencia bancaria; único en todo el sistema.';

CREATE INDEX idx_pagos_referencia     ON pagos (num_referencia);
CREATE INDEX idx_pagos_fecha          ON pagos (fecha_pago);
CREATE INDEX idx_pagos_licencia       ON pagos (id_licencia);
CREATE INDEX idx_pagos_autorizacion   ON pagos (id_autorizacion);
CREATE INDEX idx_pagos_participacion  ON pagos (id_participacion);
CREATE INDEX idx_pagos_banco          ON pagos (id_banco);
CREATE INDEX idx_pagos_registrado_por ON pagos (registrado_por);


-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Aplica el trigger a cada tabla con columna updated_at
CREATE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_comercializadores_updated_at
    BEFORE UPDATE ON comercializadores
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_operadoras_updated_at
    BEFORE UPDATE ON operadoras
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_centros_apuesta_updated_at
    BEFORE UPDATE ON centros_apuesta
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_solicitudes_updated_at
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_documentos_emitidos_updated_at
    BEFORE UPDATE ON documentos_emitidos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_pagos_updated_at
    BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ============================================================
-- TRIGGER: Validacion de pago para licencias vigentes
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_pago_licencia()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.estado_documento = 'vigente'
       AND NEW.tipo = 'Licencia' THEN
        IF NOT EXISTS (
            SELECT 1
            FROM pagos p
            WHERE p.id_licencia = NEW.id_documento
        ) THEN
            RAISE EXCEPTION 'No se puede emitir una licencia vigente sin pago registrado (documento: %)',
                NEW.numero_documento;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_pago_licencia
    BEFORE INSERT OR UPDATE ON documentos_emitidos
    FOR EACH ROW EXECUTE FUNCTION fn_validar_pago_licencia();

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================