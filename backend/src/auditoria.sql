-- ============================================================
-- AUDITORÍA — Script SQL opcional
-- Tabla `bitacora_auditoria` para registrar eventos a futuro.
--
-- En la versión actual, el módulo de Auditoría extrae la
-- información directamente de los campos `registrado_por` y
-- `created_at`/`updated_at` ya existentes en `solicitudes`,
-- `pagos`, `personas` y `usuarios`. Este script queda como
-- referencia para una futura tabla de logs dedicada, que
-- permitiría registrar eventos a nivel global (incluyendo
-- eliminaciones, accesos y acciones sobre catálogos).
-- ============================================================

-- Crear la extensión pgcrypto si no existe (para gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE bitacora_auditoria (
    id_log           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario       UUID,
    rol              VARCHAR(50),
    modulo           VARCHAR(100) NOT NULL,
    accion           VARCHAR(50)  NOT NULL,         -- INSERT | UPDATE | DELETE | LOGIN | ...
    entidad          VARCHAR(100),                  -- nombre de la tabla afectada
    id_registro      UUID,                          -- PK de la fila afectada
    descripcion      TEXT,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        INET,
    created_at       TIMESTAMP    NOT NULL DEFAULT now(),

    CONSTRAINT fk_bitacora_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE
);

COMMENT ON TABLE  bitacora_auditoria            IS 'Bitácora global de eventos del sistema (auditoría de seguridad).';
COMMENT ON COLUMN bitacora_auditoria.accion     IS 'Tipo de acción: INSERT, UPDATE, DELETE, LOGIN, etc.';
COMMENT ON COLUMN bitacora_auditoria.entidad    IS 'Nombre de la tabla afectada por la acción.';
COMMENT ON COLUMN bitacora_auditoria.id_registro IS 'UUID de la fila afectada en la tabla original.';

CREATE INDEX idx_bitacora_fecha       ON bitacora_auditoria (created_at DESC);
CREATE INDEX idx_bitacora_usuario     ON bitacora_auditoria (id_usuario);
CREATE INDEX idx_bitacora_modulo      ON bitacora_auditoria (modulo);
CREATE INDEX idx_bitacora_accion      ON bitacora_auditoria (accion);
CREATE INDEX idx_bitacora_entidad     ON bitacora_auditoria (entidad, id_registro);
