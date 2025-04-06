module.exports = {
  apps: [
    {
      name: "sally-suite",
      script: "npm",
      args: "start",
      instances: "max", // Use maximum number of CPU cores
      exec_mode: "cluster", // Run in cluster mode for load balancing
      watch: false,
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
