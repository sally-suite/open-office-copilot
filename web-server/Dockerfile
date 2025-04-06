# Use the official Node.js image as the build environment
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Install build tools (if there are native dependencies)
RUN apk add --no-cache python3 py3-pip py3-setuptools make g++

# Copy package-related files
COPY package*.json ./

# Configure the enterprise internal NPM source (if applicable)
# RUN npm config set registry http://your-internal-npm-registry

# Only install production dependencies, avoid devDependencies
RUN npm install --omit=dev

# Globally install PM2
RUN npm install -g pm2

# Copy the source code
COPY . .

# Build the application
RUN npm run build


# Production environment image, use a smaller base image
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Set the production environment variable
ENV NODE_ENV=production

# Add a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy necessary files to the runtime environment
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./

# Switch to the non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Use PM2 to run Next.js
# CMD ["pm2-runtime", "npm", "--", "start"]
# CMD ["npx", "pm2", "start", "npm", "--", "start"]
# CMD ["npm", "run", "start"]
#  npx pm2 start npm  --name sally -- start
# CMD ["npx", "pm2", "start", "npm","--name","sally-suite", "--", "start"]

# Use PM2 to start the Next.js application
CMD ["npx", "pm2-runtime", "npm", "--", "start"]
