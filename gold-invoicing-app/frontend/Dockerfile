FROM node:18-alpine

WORKDIR /app

# Copy only package files first to use cache
COPY package*.json ./

# Install cleanly
RUN npm install

# Then copy the rest of the code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]