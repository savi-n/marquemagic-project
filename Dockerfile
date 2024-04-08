FROM node:12.2.0-alpine as build
WORKDIR /nconboarding
COPY package.json .
#RUN npm cache clean --force
#RUN npm install
COPY . .
RUN npm run build:docker
# ARG BUILD_COMMAND
# RUN ${BUILD_COMMAND}


FROM nginx:latest

# Copy Nginx configuration files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/site.conf /etc/nginx/conf.d/default.conf

# Copy the React builds from the builder stage to the nginx image

COPY --from=build /nconboarding/build /usr/share/nginx/html/nconboarding


# Start Nginx
CMD ["nginx", "-g", "daemon off;"]