# Use Ubuntu 22.04 as base image (lightweight and widely compatible)
FROM ubuntu:22.04

# Set environment variables to avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install build essentials, git, and runtime dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    make \
    gcc \
    g++ \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Clone the super-pi repository
RUN git clone https://github.com/KOSASIH/super-pi.git .

# Build the super-pi application
RUN make

# Create a non-root user for security
RUN useradd -m -s /bin/bash piuser && \
    chown -R piuser:piuser /app
USER piuser

# Expose no ports (CLI application)

# Set the entrypoint to run super-pi
ENTRYPOINT ["./superpi"]
