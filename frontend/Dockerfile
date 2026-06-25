# Stage 1: build the React app
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm config set fetch-timeout 600000 && npm ci

COPY . .

# Vite bakes env vars in at build time, so they must be passed as build args.
# Defaults below point to the live backend so this works on Render without
# needing a "build args" UI option. Override locally with --build-arg if needed.
ARG VITE_API_URL=https://task-management-system-backend-spcl.onrender.com/api
ARG VITE_SOCKET_URL=https://task-management-system-backend-spcl.onrender.com
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# Stage 2: serve the built static files with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
