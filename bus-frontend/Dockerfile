FROM node:20

# Set working directory in container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of your source code
COPY . .

# Build frontend assets
RUN npm run build

# Use a simple HTTP server
RUN npm install -g serve

# Expose app port (adjust if needed)
EXPOSE 3000

# Serve the build directory
CMD ["serve", "-s", "dist", "-l", "3000"]
