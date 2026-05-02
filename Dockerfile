# Simple: copy static files into nginx
# No build step needed — vanilla HTML/CSS/JS
FROM nginx:1.25-alpine

# Build argument for API URL, with a default value
ARG API_URL=http://localhost:8080

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy all frontend files
COPY . /usr/share/nginx/html/

# Generate a config.js file with the API URL at build time
RUN echo "const CONFIG = { API_URL: '${API_URL}' };" \
    > /usr/share/nginx/html/js/config.js

# Copy our config
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["/bin/sh", "-c", "sed -i \"s/listen 80/listen ${PORT:-80}/g\" /etc/nginx/conf.d/nginx.conf && nginx -g 'daemon off;'"]