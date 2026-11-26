# 1. Base Image : Node 24 debain slim 
FROM node:24-slim

#2. Set working directory
WORKDIR /app

#3 Install pnpm (excat version)
RUN npm install -g pnpm@10.34.5

#4a. Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 5. Install dependencies exactly as the lockfile says
RUN pnpm install --frozen-lockfile

#for 4b . Copy the rest of the application code
COPY . .

# 6. Build the application

RUN pnpm run build


#7 . Document the app`s ports 

EXPOSE 9999

#8 Start the application
CMD ["node", "dist/main"]