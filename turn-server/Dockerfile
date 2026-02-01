# Dockerfile for coturn TURN server
FROM coturn/coturn:latest

# Copy configuration
COPY turnserver.conf /etc/coturn/turnserver.conf

# Expose ports
EXPOSE 3478 3478/udp 5349 5349/udp

CMD ["-c", "/etc/coturn/turnserver.conf"]
