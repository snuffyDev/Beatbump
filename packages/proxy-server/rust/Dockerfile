FROM rustlang/rust:nightly as builder
WORKDIR /usr/src/bb-proxy
COPY . .
RUN cargo install --features vendored --path .


FROM  debian:latest
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y pkg-config ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/bb-proxy /usr/local/bin/bb-proxy

EXPOSE 3001
CMD ["bb-proxy"]
