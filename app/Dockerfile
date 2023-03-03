FROM node:18-alpine3.15

WORKDIR /app

ARG PORT
ENV PORT ${PORT}
# install dependencies
COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

# copy local files to image
COPY . .

RUN npm exec svelte-kit sync
RUN npm run bb:build

FROM node:18-alpine3.15 as app

# RUN apk add --update nodejs npm
WORKDIR /app

COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/build ./build
COPY --from=0 /app/svelte.config.js .
COPY --from=0 /app/vite.config.ts .
COPY --from=0 /app/package.json ./


EXPOSE 3000

CMD [ "node", "./build"]
