import { Server } from "http";
import { logger } from "./logger";
import db from "../configs/db";
import redisClient from "../configs/redis";

export const configureGracefulShutdown = (server: Server) => {
  const signals = ["SIGTERM", "SIGINT"];

  signals.forEach(signal => {
    process.on(signal, () => {
      logger.info(`\n${signal} signal received. Shutting down gracefully...`);

      server.close(async err => {
        if (err) {
          logger.error(err, "Error during server close");
          process.exit(1);
        }

        logger.info("HTTP server closed.");

        try {
          await db.$client.end();
          logger.info("Database pool closed.");
        } catch (dbErr) {
          logger.error(dbErr, "Error closing database pool");
        }

        try {
          await redisClient.quit();
          logger.info("Redis connection closed.");
        } catch (redisErr) {
          logger.error(redisErr, "Error closing Redis connection");
        }

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error(
          "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
      }, 10000);
    });
  });
};
