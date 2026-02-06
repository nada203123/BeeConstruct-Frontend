FROM node:20.13.1 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build 


FROM nginx:1.21.6-alpine
COPY --from=builder /app/dist/bee-construct-front-end /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

