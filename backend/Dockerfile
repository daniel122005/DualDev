# Imagen de producción del backend: Node + JDK 17 (javac/java para el ejecutor de código).
# JDK 17 a propósito: la Guardia depende del Security Manager, que no existe desde Java 24.
FROM eclipse-temurin:17-jdk-jammy AS jdk

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    RUNNER=contenedor \
    JAVA_HOME=/opt/java/openjdk \
    RUNNER_SANDBOX_UID=10001 \
    RUNNER_SANDBOX_GID=10001 \
    RUNNER_PERMITIR_SIN_SANDBOX=true
# RUNNER_PERMITIR_SIN_SANDBOX=true (decisión 2026-10-27): Render no deja cambiar de usuario Linux
# (setgroups -> EPERM aunque sandboxexec tenga cap_setuid/cap_setgid), así que ahí el código del
# estudiante corre con el usuario del backend y la Guardia es la barrera principal, igual que antes
# del 25/10. En una plataforma que sí lo permita, el usuario sandbox se activa solo. Quitar esta
# línea vuelve a la falla cerrada (el servidor no arranca sin aislamiento).
COPY --from=jdk /opt/java/openjdk /opt/java/openjdk

# Usuario SIN PRIVILEGIOS para correr el código de los estudiantes, DISTINTO del usuario "node" que
# corre el backend: aunque el código escape de la Guardia (Security Manager), al estar en otro
# usuario de Linux no puede leer /proc/<pid>/environ del backend (la llave secreta) ni sus archivos.
# sandboxexec (docker/sandboxexec.c, binario propio y mínimo) es quien cambia de usuario antes de
# compilar/correr el código Y antes de matarlo si se agota el tiempo: SIEMPRE al usuario sandbox
# (uid/gid escritos en su código, nunca recibidos como argumento). Se le da la capacidad justa para
# eso (cap_setuid/cap_setgid) A ÉL, no a una herramienta genérica como setpriv ni al runtime de Node
# (V8 + todas las dependencias npm tienen mucha más superficie): si el backend se compromete por
# completo, lo único que se puede lograr invocando este binario es correr como sandbox, nunca como
# root ni como ningún otro usuario, porque el destino no es un argumento que se pueda cambiar.
COPY docker/sandboxexec.c /tmp/sandboxexec.c
RUN apt-get update && apt-get install -y --no-install-recommends libcap2-bin gcc libc6-dev \
  && gcc -O2 -Wall -Wextra -o /usr/local/bin/sandboxexec /tmp/sandboxexec.c \
  && chown root:root /usr/local/bin/sandboxexec && chmod 0755 /usr/local/bin/sandboxexec \
  && setcap cap_setuid,cap_setgid+ep /usr/local/bin/sandboxexec \
  && apt-get purge -y --auto-remove gcc libc6-dev \
  && rm -rf /var/lib/apt/lists/* /tmp/sandboxexec.c \
  && groupadd --gid 10001 sandbox \
  && useradd --uid 10001 --gid sandbox --no-create-home --shell /usr/sbin/nologin sandbox

# Clases de javac ya preparadas: en 0,1 CPU, arrancar el compilador es buena parte de la espera al
# enviar código. Los -J deben coincidir con ARGS_JVM_CORTA de runner/javaLocal.js. De solo lectura
# (lo usa también el usuario sandbox). Si esto falla no se detiene el despliegue: se compila sin él.
ENV RUNNER_JAVAC_CDS=/opt/dualdev/javac.jsa
RUN mkdir -p /opt/dualdev /tmp/cds \
  && printf 'import java.util.Scanner;\npublic class Cds { public static void main(String[] a) { Scanner s = new Scanner(System.in); for (int i = 0; i < s.nextInt(); i++) { System.out.println("n " + i); } } }\n' > /tmp/cds/Cds.java \
  && { /opt/java/openjdk/bin/javac -J-Xmx256m -J-XX:TieredStopAtLevel=1 -J-XX:CICompilerCount=1 -J-XX:+UseSerialGC \
       -J-XX:ArchiveClassesAtExit=/opt/dualdev/javac.jsa -encoding UTF-8 -proc:none -nowarn -d /tmp/cds /tmp/cds/Cds.java \
       && chmod 0444 /opt/dualdev/javac.jsa || echo "Sin archivo CDS de javac: se compilará sin él"; } \
  && rm -rf /tmp/cds

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src

# Sin root: el backend corre como "node", y el código de los estudiantes como "sandbox" (arriba),
# nunca como este usuario (runner/index.js se niega a arrancar como root o sin RUNNER_SANDBOX_*).
USER node

EXPOSE 4000
CMD ["node", "src/server.js"]
