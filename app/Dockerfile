FROM node:18-alpine3.15

WORKDIR /app
# RUN apk add --update nodejs npm
# install dependencies
COPY package.json package-lock.json ./

RUN npm ci

# copy local files to image
COPY . .

RUN npm run bb:build

FROM node:18-alpine3.15 as app

# RUN apk add --update nodejs npm
WORKDIR /app

COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/build ./build
COPY --from=0 /app/svelte.config.js .
COPY --from=0 /app/vite.config.ts .
COPY --from=0 /app/package.json ./

ENV VITE_DOMAIN="localhost"
ENV VITE_SITE_URL="http://localhost:3000"
ENV ORIGIN="http://localhost:3000"
ENV PORT=3000

EXPOSE 3000
CMD [ "node", "./build"]