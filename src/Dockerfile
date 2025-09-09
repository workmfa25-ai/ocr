FROM node:20-alpine

WORKDIR /app

# Copy package files first for caching
#COPY package.json package-lock.json ./
COPY OCR-New-Frontend/package.json OCR-New-Frontend/package-lock.json ./
# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY OCR-New-Frontend/ ./

# Build the app
RUN npm run build

# Use nginx to serve the build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
