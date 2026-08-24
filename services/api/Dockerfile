FROM golang:1.25-alpine AS build
WORKDIR /src
COPY services/api/go.mod services/api/go.sum* ./
RUN go mod download
COPY services/api/ .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/propflow-api ./cmd/api

FROM alpine:3.22
RUN addgroup -S app && adduser -S -G app app
WORKDIR /app
COPY --from=build /out/propflow-api /app/propflow-api
COPY infra/healthcheck /app/healthcheck
USER root
RUN chmod 0555 /app/healthcheck
USER app
EXPOSE 8080
ENTRYPOINT ["/app/propflow-api"]
