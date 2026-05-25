FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_VENTAS_API_URL=http://localhost:8082
ARG VITE_DESPACHOS_API_URL=http://localhost:8081
ENV VITE_VENTAS_API_URL=$VITE_VENTAS_API_URL
ENV VITE_DESPACHOS_API_URL=$VITE_DESPACHOS_API_URL

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

