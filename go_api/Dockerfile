# Builder
FROM golang:1.24-bullseye AS builder
WORKDIR /app
ENV CGO_ENABLED=0 GOOS=linux GOTOOLCHAIN=auto

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build \
    go build -o /out/api ./cmd/api

# Runner
FROM gcr.io/distroless/static-debian12
WORKDIR /app
# Mount your config.yml here at runtime (-v /path/to/config.yml:/app/config.yml:ro)
EXPOSE 8080
COPY --from=builder /out/api /usr/local/bin/api
ENTRYPOINT ["/usr/local/bin/api"]
