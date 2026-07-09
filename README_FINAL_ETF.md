# Innovatech Chile — Frontend

Dashboard React (Vite) de la plataforma Innovatech Chile, que consume las APIs REST de los microservicios de Ventas y Despachos. Desplegado en AWS ECS Fargate detrás de un Application Load Balancer, con pipeline CI/CD automatizado y tests unitarios con Vitest.

## Arquitectura

- **React + Vite**, servido en producción por Nginx (imagen `nginx:alpine`)
- Se comunica con los microservicios backend vía las variables `VITE_VENTAS_API_URL` y `VITE_DESPACHOS_API_URL`, inyectadas en tiempo de build
- **Orquestación en la nube:** AWS ECS Fargate, servicio `frontend-svc`, balanceado por `innovatech-alb`
- **CI/CD:** GitHub Actions, workflow disparado en cada push a la rama `deploy`

## Ejecutar en local

### Opción A — junto al resto del stack (recomendado)
Ver instrucciones de `docker-compose.yml` en el repo [`innovatech-backend`](https://github.com/Luch0Sl1m1ng/innovatech-backend), que levanta este frontend junto con ambos microservicios y la base de datos.

### Opción B — solo el frontend, en modo desarrollo
```bash
npm install
npm run dev
```

## Tests automatizados

```bash
npm test
```

Ejecuta la suite de pruebas unitarias con [Vitest](https://vitest.dev/), incluyendo validaciones de funciones utilitarias del dominio (`src/utils/`). Este mismo comando se ejecuta automáticamente en el pipeline de CI/CD antes de construir la imagen Docker.

## Pipeline CI/CD

Cada push a la rama `deploy` dispara `.github/workflows/deploy-front.yml`, que ejecuta:

1. Checkout del código
2. Set up Node.js
3. `npm ci` (instalación reproducible de dependencias)
4. **`npm test`** (Vitest)
5. Configuración de credenciales AWS
6. Login a Amazon ECR
7. Build (con las URLs de las APIs como `--build-arg`) y push de la imagen Docker
8. Force new deployment en ECS
9. Espera a que el servicio se estabilice (`ecs wait services-stable`)

## Seguridad

- Build multietapa: la imagen final no contiene Node.js, npm ni el código fuente, solo los archivos estáticos compilados
- El contenedor Nginx corre con un usuario no privilegiado (`USER nginx`)
- Único puerto expuesto: 80
- Las URLs de las APIs backend se inyectan en build-time, sin credenciales ni secretos embebidos en el bundle

## Integrantes

Luis Alejandro Rojas Gil — RUT 27.204.304-3
Tomás Andrés González Borje — RUT 19.277.589-2

Asignatura ISY1101 — Introducción a Herramientas DevOps — DuocUC 2026
