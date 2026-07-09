FROM node:18-alpine AS build
WORKDIR /app
ARG VITE_VENTAS_API_URL
ARG VITE_DESPACHOS_API_URL
ENV VITE_VENTAS_API_URL=$VITE_VENTAS_API_URL
ENV VITE_DESPACHOS_API_URL=$VITE_DESPACHOS_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
RUN touch /var/run/nginx.pid && \
chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
