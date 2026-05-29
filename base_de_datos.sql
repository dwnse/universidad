-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.auditoria (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid,
  tabla character varying,
  accion character varying,
  descripcion text,
  fecha timestamp without time zone DEFAULT now(),
  CONSTRAINT auditoria_pkey PRIMARY KEY (id),
  CONSTRAINT auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.aulas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  capacidad integer NOT NULL,
  ubicacion character varying,
  activa boolean DEFAULT true,
  CONSTRAINT aulas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.calendario_academico (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  periodo_id uuid,
  evento character varying NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  descripcion text,
  CONSTRAINT calendario_academico_pkey PRIMARY KEY (id),
  CONSTRAINT calendario_academico_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos_academicos(id)
);
CREATE TABLE public.carreras (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL UNIQUE,
  codigo character varying NOT NULL UNIQUE,
  descripcion text,
  activa boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT carreras_pkey PRIMARY KEY (id)
);
CREATE TABLE public.docentes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid UNIQUE,
  especialidad character varying,
  carga_horaria_maxima integer DEFAULT 40,
  disponibilidad boolean DEFAULT true,
  activo boolean DEFAULT true,
  CONSTRAINT docentes_pkey PRIMARY KEY (id),
  CONSTRAINT docentes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.estudiante_carreras (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  estudiante_id uuid NOT NULL,
  carrera_id uuid NOT NULL,
  carrera_principal boolean DEFAULT false,
  fecha_asignacion date DEFAULT CURRENT_DATE,
  CONSTRAINT estudiante_carreras_pkey PRIMARY KEY (id),
  CONSTRAINT estudiante_carreras_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(id)
);
CREATE TABLE public.estudiantes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid UNIQUE,
  registro_universitario character varying NOT NULL UNIQUE,
  estado_academico USER-DEFINED DEFAULT 'REGULAR'::estado_estudiante,
  fecha_ingreso date NOT NULL,
  activo boolean DEFAULT true,
  CONSTRAINT estudiantes_pkey PRIMARY KEY (id),
  CONSTRAINT estudiantes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.historial_academico (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  estudiante_id uuid,
  materia_id uuid,
  periodo_id uuid,
  nota_final numeric,
  aprobado boolean,
  fecha_registro timestamp without time zone DEFAULT now(),
  CONSTRAINT historial_academico_pkey PRIMARY KEY (id),
  CONSTRAINT historial_academico_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id),
  CONSTRAINT historial_academico_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT historial_academico_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos_academicos(id)
);
CREATE TABLE public.inscripciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  estudiante_id uuid,
  paralelo_id uuid,
  estado USER-DEFINED DEFAULT 'INSCRITO'::estado_inscripcion,
  nota_primer_parcial numeric DEFAULT 0 CHECK (nota_primer_parcial >= 0::numeric AND nota_primer_parcial <= 100::numeric),
  nota_segundo_parcial numeric DEFAULT 0 CHECK (nota_segundo_parcial >= 0::numeric AND nota_segundo_parcial <= 100::numeric),
  nota_examen_final numeric DEFAULT 0 CHECK (nota_examen_final >= 0::numeric AND nota_examen_final <= 100::numeric),
  promedio_final numeric DEFAULT (((nota_primer_parcial + nota_segundo_parcial) + nota_examen_final) / (3)::numeric),
  fecha_inscripcion timestamp without time zone DEFAULT now(),
  CONSTRAINT inscripciones_pkey PRIMARY KEY (id),
  CONSTRAINT inscripciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id),
  CONSTRAINT inscripciones_paralelo_id_fkey FOREIGN KEY (paralelo_id) REFERENCES public.paralelos(id)
);
CREATE TABLE public.logs_sistema (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid,
  accion text,
  ip_address character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT logs_sistema_pkey PRIMARY KEY (id),
  CONSTRAINT logs_sistema_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.materias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  codigo character varying NOT NULL UNIQUE,
  nombre character varying NOT NULL,
  descripcion text,
  creditos integer DEFAULT 1,
  horas_teoricas integer DEFAULT 0,
  horas_practicas integer DEFAULT 0,
  tipo USER-DEFINED DEFAULT 'OBLIGATORIA'::tipo_materia,
  estado USER-DEFINED DEFAULT 'ACTIVA'::estado_materia,
  activa boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT materias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materias_prerrequisitos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  materia_id uuid,
  materia_prerrequisito_id uuid,
  CONSTRAINT materias_prerrequisitos_pkey PRIMARY KEY (id),
  CONSTRAINT materias_prerrequisitos_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT materias_prerrequisitos_materia_prerrequisito_id_fkey FOREIGN KEY (materia_prerrequisito_id) REFERENCES public.materias(id)
);
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid,
  tipo USER-DEFINED NOT NULL,
  titulo character varying NOT NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  fecha_envio timestamp without time zone DEFAULT now(),
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.paralelos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  materia_id uuid,
  periodo_id uuid,
  docente_id uuid,
  aula_id uuid,
  nombre character varying NOT NULL,
  turno USER-DEFINED NOT NULL,
  horario_inicio time without time zone NOT NULL,
  horario_fin time without time zone NOT NULL,
  cupo_maximo integer DEFAULT 40,
  cupo_actual integer DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT paralelos_pkey PRIMARY KEY (id),
  CONSTRAINT paralelos_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT paralelos_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos_academicos(id),
  CONSTRAINT paralelos_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id),
  CONSTRAINT paralelos_aula_id_fkey FOREIGN KEY (aula_id) REFERENCES public.aulas(id)
);
CREATE TABLE public.pensum (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  carrera_id uuid,
  materia_id uuid,
  semestre integer NOT NULL,
  nivel integer NOT NULL,
  obligatoria boolean DEFAULT true,
  CONSTRAINT pensum_pkey PRIMARY KEY (id),
  CONSTRAINT pensum_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(id),
  CONSTRAINT pensum_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id)
);
CREATE TABLE public.periodos_academicos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre character varying NOT NULL,
  modalidad USER-DEFINED NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  estado USER-DEFINED DEFAULT 'INSCRIPCION'::estado_periodo,
  activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT periodos_academicos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombres character varying NOT NULL,
  apellidos character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  rol USER-DEFINED NOT NULL,
  ci character varying UNIQUE,
  telefono character varying,
  foto_perfil text,
  estado USER-DEFINED DEFAULT 'ACTIVO'::estado_usuario,
  ultimo_login timestamp without time zone,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);