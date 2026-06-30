# Innovatech Frontend — Despliegue en AWS ECS Fargate

Frontend del proyecto Innovatech, desarrollado en React + Vite, servido mediante Nginx. Desplegado en AWS ECS Fargate como parte de la Evaluación Parcial 3 (ISY1101 - Introducción a Herramientas DevOps, DuocUC).

## Stack técnico

- React + Vite
- Nginx (alpine) como servidor de archivos estáticos
- Docker, AWS ECS Fargate
- Tailwind CSS

## Arquitectura desplegada en AWS

```
        Usuario (navegador)
                │
                ▼
      http://<ALB_DNS>/
                │
                ▼
┌───────────────────────────┐
│  Application Load Balancer │
│      innovatech-alb        │
│      listener :80          │
└─────────────┬──────────────┘
              ▼
       ┌─────────────┐
       │ tg-frontend │
       └──────┬──────┘
              ▼
       ┌─────────────┐
       │ frontend-svc│
       │ (ECS Fargate)│
       └─────────────┘

  El navegador del usuario realiza además
  llamadas directas a los backends a través
  de otros listeners del mismo ALB:
  http://<ALB_DNS>:8082/api/v1/ventas
  http://<ALB_DNS>:8081/api/v1/despachos
```

Clúster: `innovatech-cluster` (ECS Fargate, región `us-east-1`).
Servicio: `frontend-svc`, puerto del contenedor 80, balanceado por `tg-frontend`.

## Configuración de URLs del backend

El código consume las URLs de los microservicios mediante variables de entorno de Vite, definidas en `src/config/api.js`:

```js
export const ventasApiUrl =
  import.meta.env.VITE_VENTAS_API_URL || "http://localhost:8082";
export const despachosApiUrl =
  import.meta.env.VITE_DESPACHOS_API_URL || "http://localhost:8081";
```

Como Vite inyecta las variables `VITE_*` en **tiempo de build** (no en runtime), estas se pasan como `--build-arg` durante el `docker build` en el pipeline de GitHub Actions, apuntando al DNS público del ALB:

```
VITE_VENTAS_API_URL=http://<ALB_DNS>:8082
VITE_DESPACHOS_API_URL=http://<ALB_DNS>:8081
```

El `Dockerfile` declara estos `ARG` y los expone como `ENV` antes de ejecutar `npm run build`, de forma que Vite los embeba en el bundle estático final.

## Pipeline CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy-front.yml`, disparado por push a la rama `deploy`.

Flujo: `checkout → configure AWS credentials → login ECR → docker build (con build-args de Vite) / push → ecs update-service --force-new-deployment → ecs wait services-stable`.

### Secrets de GitHub Actions requeridos

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
```

Credenciales temporales de AWS Academy Learner Lab; deben renovarse periódicamente.

## Autoscaling

Política de Target Tracking configurada en `frontend-svc`:

- Métrica: `ECSServiceAverageCPUUtilization`
- Umbral objetivo: **50% CPU**
- Mín. tareas: 1, Máx. tareas: 3

Mismo criterio de justificación que en el backend: el 50% deja margen de reacción suficiente sin sacrificar disponibilidad ante picos de tráfico.

## Logs y observabilidad

Logs enviados a CloudWatch Logs, log group `/ecs/innovatech`, stream prefix `frontend/`.

## Problemas encontrados durante el despliegue y solución

| Problema | Causa | Solución |
|---|---|---|
| `nginx: [emerg] bind() to 0.0.0.0:80 failed (13: Permission denied)` — la tarea moría inmediatamente tras arrancar | El `Dockerfile` ejecuta Nginx con un usuario no privilegiado (`USER nginx`), que en el entorno estricto de Fargate no tiene permisos para hacer bind al puerto 80 (puerto privilegiado en Linux) | Se sobreescribió el usuario del contenedor a `root` directamente en la Task Definition de ECS (`"user": "root"`), sin necesidad de reconstruir la imagen ni modificar el código fuente |
| El backend respondía datos vacíos en el frontend desplegado pese a que las APIs funcionaban correctamente vía Postman | El frontend usaba el fallback de desarrollo (`localhost:8082`/`localhost:8081`), ya que las variables `VITE_*` no se habían inyectado durante el build de producción en CI/CD | Se agregaron los `--build-arg` correspondientes en el workflow de GitHub Actions y se actualizó el `Dockerfile` para aceptar y exponer dichos `ARG` antes del `npm run build` |
| `failed to read dockerfile: open DockerFile: no such file or directory` en el runner de GitHub Actions, pese a que el archivo existía en el repositorio | Posible discrepancia de sincronización entre la rama `deploy` y el contenido visible en la interfaz web de GitHub al momento de los primeros commits | Se reemplazó la referencia fija al nombre del archivo por una búsqueda dinámica insensible a mayúsculas (`find . -maxdepth 1 -iname "dockerfile"`), haciendo el pipeline resiliente a variaciones de capitalización del nombre del archivo |

## Verificación de comunicación Frontend → Backend

La comunicación fue validada en vivo mediante las herramientas de desarrollo del navegador (pestaña Network), confirmando peticiones `GET` exitosas (`200 OK`) desde la aplicación renderizada hacia ambos backends a través del ALB, así como la correcta persistencia y lectura de datos de prueba insertados vía `POST` directo a las APIs (visibles posteriormente en las tablas del dashboard).

## Ejecución local (desarrollo)

```bash
npm install
npm run dev
```

Por defecto consume `http://localhost:8082` y `http://localhost:8081`; para apuntar a otro entorno, definir un archivo `.env`:

```
VITE_VENTAS_API_URL=http://<host>:8082
VITE_DESPACHOS_API_URL=http://<host>:8081
```
