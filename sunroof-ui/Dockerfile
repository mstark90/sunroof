# Step 1: Use an official Nginx image
FROM nginx:alpine

# Step 2: Copy build files to Nginx public folder
COPY ./dist /usr/share/nginx/html

# Step 3: Copy custom Nginx config (optional, but recommended)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Step 4: Expose port 80
EXPOSE 80

# Step 5: Start Nginx
CMD ["nginx", "-g", "daemon off;"]