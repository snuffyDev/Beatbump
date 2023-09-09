# Use a multi-stage build for better image size
FROM node:20-alpine3.18 as builder

WORKDIR /app

ARG PORT
ENV PORT ${PORT}

ARG ALLOW_IFRAME
ENV ALLOW_IFRAME ${ALLOW_IFRAME}
ARG PUBLIC_ALLOW_THUMBNAIL_PROXY
ENV PUBLIC_ALLOW_THUMBNAIL_PROXY ${PUBLIC_ALLOW_THUMBNAIL_PROXY}

# install dependencies
COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

# copy local files to image
COPY . .

RUN npm exec svelte-kit sync
RUN PORT=${PORT} \
    ALLOW_IFRAME=${ALLOW_IFRAME} \
    PUBLIC_ALLOW_THUMBNAIL_PROXY=${PUBLIC_ALLOW_THUMBNAIL_PROXY} \
    node ./scripts/build.cjs build

# Start a new stage for the final image
FROM node:20-alpine3.18 as app

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/svelte.config.js .
COPY --from=builder /app/vite.config.ts .
COPY --from=builder /app/package.json ./


EXPOSE 3000

CMD [ "node", "./build"]
