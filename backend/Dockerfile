# Imagen de producción del backend: Node + JDK 17 (javac/java para el ejecutor de código).
# JDK 17 a propósito: la Guardia depende del Security Manager, que no existe desde Java 24.
FROM eclipse-temurin:17-jdk-jammy AS jdk

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    RUNNER=contenedor \
    JAVA_HOME=/opt/java/openjdk
COPY --from=jdk /opt/java/openjdk /opt/java/openjdk

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY src ./src

# Sin root: los programas de los estudiantes heredan este usuario (runner/index.js se niega a
# arrancar como root).
USER node

EXPOSE 4000
CMD ["node", "src/server.js"]
