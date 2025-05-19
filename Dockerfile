# Use nginx base image to serve your static site
FROM nginx:alpine

# Clean default nginx HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy game files to nginx public directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
