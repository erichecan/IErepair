# Pre-built dist/ is copied into nginx (build runs locally via npm run build)
FROM nginx:alpine
COPY dist /usr/share/nginx/html
# SPA fallback: all routes → index.html
RUN printf 'server {\n  listen 8080;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
