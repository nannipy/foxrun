FROM oven/bun:1

WORKDIR /app

# Copy dependency files first for better layer caching
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server with host binding on port 5173
CMD ["bun", "run", "dev", "--host", "0.0.0.0", "--port", "5173"]
