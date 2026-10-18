-- DUALDEV · Fase 4 · Escala de niveles alineada con el diseño (7 niveles).
-- Idempotente. Los umbrales se dedujeron de los datos de ejemplo del ranking en Figma Make.

-- puntos_minimos es UNIQUE: se mueven primero a valores temporales para no chocar al reasignar.
update public.nivel set puntos_minimos = 1000000 + numero where puntos_minimos < 1000000;

insert into public.nivel (numero, nombre, puntos_minimos) values
  (1, 'Inicial',                  0),
  (2, 'Aprendiz',               300),
  (3, 'Explorador',             800),
  (4, 'Programador Junior',    1100),
  (5, 'Programador Intermedio', 1500),
  (6, 'Programador Avanzado',   2100),
  (7, 'Maestro de ciclos',      2700)
on conflict (numero) do update
  set nombre = excluded.nombre, puntos_minimos = excluded.puntos_minimos;
