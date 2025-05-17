# Use an Nginx base image
FROM nginx:alpine

# Copy your game files to the Nginx HTML directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80
