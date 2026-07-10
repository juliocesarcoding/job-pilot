# Architecture

The initial architecture uses a modular monolith with separate application packages for the API, web dashboard, and worker. Shared domain logic lives in the shared package, while Prisma is isolated in the database package and external services are represented by dedicated adapters.
