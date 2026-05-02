# Simple: copy static files into nginx
# No build step needed — vanilla HTML/CSS/JS
FROM nginx:1.25-alpine

# Build argument for API URL, with a default value
ARG API_URL=http://localhost:8080

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our config
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

# Copy all frontend files
COPY . /usr/share/nginx/html/

# Generate a config.js file with the API URL at build time
RUN echo "const CONFIG = { API_URL: '${API_URL}' };" \
    > /usr/share/nginx/html/js/config.js

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]