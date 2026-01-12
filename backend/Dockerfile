FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including curl for healthcheck
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 