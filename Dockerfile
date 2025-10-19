# Dockerfile — builds the AutoNIST Core API container
# FedRAMP-aligned base image (slim, minimal attack surface)

FROM python:3.12-slim

# Metadata for traceability
LABEL maintainer="Travahnti Tyson" \
      project="AutoNIST Core" \
      compliance="NIST 800-171 / FedRAMP High"

# Set working directory
WORKDIR /app

# Copy dependency list and install packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY ./src ./src

# Expose FastAPI port
EXPOSE 8080

# Run the API
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]

# Add before final CMD
RUN adduser --disabled-password --gecos "" autonist \
 && chown -R autonist /app
USER autonist

# Enforce read-only filesystem and drop privileges
# (Done at runtime using Compose or Kubernetes)
