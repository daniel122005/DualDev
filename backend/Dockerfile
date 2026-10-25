# Imagen de producción del backend: Node + JDK 17 (javac/java para el ejecutor de código).
# JDK 17 a propósito: la Guardia depende del Security Manager, que no existe desde Java 24.
FROM eclipse-temurin:17-jdk-jammy AS jdk

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    RUNNER=contenedor \
    JAVA_HOME=/opt/java/openjdk \
    RUNNER_SANDBOX_UID=10001 \
    RUNNER_SANDBOX_GID=10001
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

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src

# Sin root: el backend corre como "node", y el código de los estudiantes como "sandbox" (arriba),
# nunca como este usuario (runner/index.js se niega a arrancar como root o sin RUNNER_SANDBOX_*).
USER node

EXPOSE 4000
CMD ["node", "src/server.js"]
