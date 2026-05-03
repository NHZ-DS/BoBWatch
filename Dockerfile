FROM node:18-slim

WORKDIR /app

COPY . .

# Debug: list files to verify data/ exists
RUN ls -la
RUN ls -la data/ || echo "data directory missing"

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "watsonx-orchestrate/api-server.js"]
