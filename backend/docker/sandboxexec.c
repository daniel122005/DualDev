/*
 * sandboxexec: deja caer el proceso a un usuario de Linux FIJO y luego ejecuta el programa que se
 * le pida. El uid/gid quedan escritos aquí, en el código (SANDBOX_UID/SANDBOX_GID), NUNCA se
 * reciben como argumento ni como variable de entorno.
 *
 * Por qué: este binario recibe la capacidad de cambiar de usuario (cap_setuid/cap_setgid, con
 * setcap en el Dockerfile) para que el backend pueda hacer que el código del estudiante corra con
 * otro usuario ("sandbox"), distinto del suyo. Si esa capacidad se le diera a una herramienta
 * genérica como setpriv, y el backend llegara a comprometerse por una vulnerabilidad sin relación
 * con esto, el atacante podría pedirle a setpriv "--reuid=0" y llegar a root dentro del contenedor.
 * Aquí el destino no es un argumento: lo único que se puede lograr invocando este binario,
 * CON TOTAL CONTROL del proceso que lo invoca, es correr algo como el usuario sandbox. Nunca como
 * root ni como ningún otro usuario.
 *
 * Uso: sandboxexec <programa> [argumentos...]
 */
#include <grp.h>
#include <stdio.h>
#include <sys/prctl.h>
#include <unistd.h>

#define SANDBOX_UID 10001
#define SANDBOX_GID 10001

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "uso: %s <programa> [argumentos...]\n", argv[0]);
        return 2;
    }

    // Que ni el propio programa que vamos a correr pueda recuperar privilegios (p. ej. si por
    // casualidad encuentra un binario con el bit setuid).
    if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0) {
        perror("prctl(PR_SET_NO_NEW_PRIVS)");
        return 1;
    }
    if (setgroups(0, NULL) != 0) {
        perror("setgroups");
        return 1;
    }
    // gid antes que uid: por costumbre (es obligatorio cuando el proceso es root; aquí no lo es,
    // las capacidades no dependen del uid, pero mantiene el mismo orden de siempre).
    if (setresgid(SANDBOX_GID, SANDBOX_GID, SANDBOX_GID) != 0) {
        perror("setresgid");
        return 1;
    }
    if (setresuid(SANDBOX_UID, SANDBOX_UID, SANDBOX_UID) != 0) {
        perror("setresuid");
        return 1;
    }

    execv(argv[1], &argv[1]);
    perror("execv"); // solo se llega aquí si execv falló
    return 1;
}
