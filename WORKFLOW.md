# 📖 How to Use This Documentation System

## Quick Start - Navigation Guide

Open Gate uses a **Skills-based documentation system** to help you find answers quickly and work efficiently.

### 🎯 Finding What You Need

**New to the project?**

1. Start with [README.md](README.md) - Architecture overview
2. Check the [Tech Stack section](README.md#-tech-stack) for available skills
3. Browse [Skills & Documentation table](README.md#-skills--documentation)

**Working on a specific feature?**

1. Identify the **domain** (backend, database, authentication, etc.)
2. Find the matching skill from the table
3. Search for the specific topic within the skill

**Debugging an issue?**

1. Check [Known Issues](README.md#-known-issues) section
2. Find the specific technology skill
3. Look for "Troubleshooting" section

---

## 📚 Available Skills

### By Purpose

| When you need to... | Read this skill |
|-------------------|-----------------|
| Understand how services communicate | [Backend Architecture](SKILL-backend-architecture.md) |
| Write business logic with Commands/Queries | [CQRS Pattern](SKILL-cqrs-pattern.md) |
| Work with database and models | [Database Management](SKILL-database-management.md) |
| Handle user login and sessions | [Authentication & Sessions](SKILL-authentication.md) |
| Send notifications (email, SMS, Signal) | [Notifications & Integrations](SKILL-notifications.md) |
| Set up local environment with Docker | [Docker Deployment](SKILL-docker-deployment.md) |

### By Technology

| Technology | Skill |
|-----------|-------|
| NestJS framework | [Backend Architecture](SKILL-backend-architecture.md) |
| gRPC inter-service | [Backend Architecture](SKILL-backend-architecture.md) |
| GraphQL frontend API | [Backend Architecture](SKILL-backend-architecture.md) |
| TypeORM & PostgreSQL | [Database Management](SKILL-database-management.md) |
| CQRS/Commands/Queries | [CQRS Pattern](SKILL-cqrs-pattern.md) |
| Sessions & OAuth | [Authentication & Sessions](SKILL-authentication.md) |
| Email/SMS/Signal APIs | [Notifications & Integrations](SKILL-notifications.md) |
| Docker & Docker Compose | [Docker Deployment](SKILL-docker-deployment.md) |

---

## 🚀 Common Workflows

### Workflow 1: Adding a New API Feature

**Scenario:** You need to add a new endpoint that returns user data

**Steps:**

1. 📖 Read: [Backend Architecture](SKILL-backend-architecture.md#communication-patterns) - Understand gRPC & GraphQL
2. 📖 Read: [CQRS Pattern](SKILL-cqrs-pattern.md#usage-in-services) - Check BFF and Core communication
3. 📖 Read: [Database Management](SKILL-database-management.md#working-with-entities) - Define entity if needed
4. **Code:**
   - Create Query in Core Service (`GetUserQuery`)
   - Create Handler (`GetUserHandler`)
   - Call from BFF via gRPC
   - Add GraphQL resolver in BFF
5. 🧪 Test: `npm run test`
6. 🐳 Run: `npm run docker:up`

### Workflow 2: Fixing Database Issue

**Scenario:** Migration failed or schema is inconsistent

**Steps:**

1. 📖 Read: [Database Management](SKILL-database-management.md#troubleshooting) section
2. 📖 Check: [Docker Deployment](SKILL-docker-deployment.md#troubleshooting) for connection issues
3. **Fix:**
   - Review migration file
   - Check entity definitions
   - Verify `.env` database credentials
4. **Rollback if needed:**

   ```bash
   npm run migration:revert
   npm run migration:run
   ```

### Workflow 3: Adding Email Notification

**Scenario:** Send welcome email to new users

**Steps:**

1. 📖 Read: [Notifications & Integrations](SKILL-notifications.md#communication-protocols) - Understand notification flow
2. 📖 Check: [CQRS Pattern](SKILL-cqrs-pattern.md#event-driven-architecture) - Events trigger notifications
3. **Code in Core Service:**
   - Create Event: `UserCreatedEvent`
   - Create Handler: `UserCreatedHandler` that calls Notify Service via gRPC
4. 📖 Reference: [Notifications skill - Email section](SKILL-notifications.md#email-notifications)
5. 🐳 Test: `npm run docker:up`

### Workflow 4: Testing a Service Locally

**Scenario:** Develop and test locally before pushing

**Steps:**

1. 📖 Read: [Docker Deployment](SKILL-docker-deployment.md#common-docker-commands)
2. 📖 Check: [Docker Deployment - Environment Variables](SKILL-docker-deployment.md#environment-variables)
   - Copy `.env.example` to `.env`
   - Fill in required values
3. **Run services:**

   ```bash
   npm run docker:up
   npm run migration:run
   npm run start:dev
   ```

4. **Access APIs:**
   - GraphQL: <http://localhost:3000/graphql>
   - gRPC Explorer: (use gRPC tools)
5. **Debug:** Check logs with `npm run docker:logs`

### Workflow 5: Understanding Service Communication

**Scenario:** Confused about how services talk to each other

**Steps:**

1. 📖 Read: [Backend Architecture - Communication Patterns](SKILL-backend-architecture.md#communication-patterns)
2. **Understand the flow:**
   - Frontend sends **GraphQL** query to BFF (port 3000)
   - BFF calls Core via **gRPC** (port 50051)
   - Core calls Notify via **gRPC** (port 50052)
   - Notify calls external APIs via **REST/HTTP** (SMTP, Twilio, Signal)
3. 📖 Check relevant proto files: `/src/proto/`
4. 📖 See architecture diagram in [README.md](README.md#architecture)

### Workflow 6: Debugging Authentication Issue

**Scenario:** User can't log in or session expired

**Steps:**

1. 📖 Read: [Authentication & Sessions - Session Lifecycle](SKILL-authentication.md#session-lifecycle)
2. 📖 Check: [Authentication - Guards](SKILL-authentication.md#session-guards-and-decorators)
3. 📖 Verify: [Docker Deployment - Redis config](SKILL-docker-deployment.md) (sessions stored in Redis)
4. **Debug:**
   - Check Redis is running: `docker compose ps redis`
   - Check session timeout: `.env` SESSION_TIMEOUT
   - Verify session cookie settings
5. 📖 Reference: [Authentication - Best Practices](SKILL-authentication.md#best-practices)

---

## 🔍 Quick Reference

### When I see an error about

| Error Type | Check This Skill | Section |
|-----------|-----------------|---------|
| Connection to Core/Notify failed | Backend Architecture | [Service Discovery](SKILL-backend-architecture.md#environment-based-service-discovery) |
| GraphQL query returns null/undefined | CQRS Pattern | [Handlers](SKILL-cqrs-pattern.md#query-handlers) |
| Database migration failed | Database Management | [Troubleshooting](SKILL-database-management.md#troubleshooting) |
| User can't login | Authentication | [Troubleshooting](SKILL-authentication.md) (planned) |
| Email not sending | Notifications | [Email section](SKILL-notifications.md#email-notifications) |
| Docker container won't start | Docker Deployment | [Troubleshooting](SKILL-docker-deployment.md#troubleshooting) |

---

## 💡 Tips for Effective Usage

### Tip 1: Use Ctrl+F / Cmd+F

- Skills are large documents
- Search within skill for specific keyword
- Example: Search "JWT" in [Authentication skill](SKILL-authentication.md)

### Tip 2: Follow Cross-References

- Each skill has **Related Documentation** at the bottom
- Skills link to each other when relevant
- Build understanding by following the chain

### Tip 3: Copy-Paste Code Examples

- All skills contain **working code snippets**
- Code is from actual project patterns
- Adapt examples to your specific use case

### Tip 4: Check Architecture Diagram First

- [Backend Architecture diagram](SKILL-backend-architecture.md#communication-patterns) explains flow
- Helps understand where to make changes
- Reference when confused about service boundaries

### Tip 5: Use Docker Commands

- All docker commands in [Docker Deployment skill](SKILL-docker-deployment.md#common-docker-commands)
- Keep this section handy during development
- Essential before testing features

---

## 📋 Skill Structure

Each skill follows this structure:

```
1. Overview - What this skill covers
2. Core Concepts - Theory and principles
3. Project Structure - File organization
4. Implementation Guide - How to build features
5. Code Examples - Copy-paste ready snippets
6. Best Practices - Do's and don'ts
7. Troubleshooting - Common issues and fixes
8. Related Documentation - Links to other skills
```

**Find what you need in seconds** by knowing this structure!

---

## 🎓 Learning Path for New Developers

### Day 1: Project Foundation

1. Read: [README.md](README.md) - Full overview
2. Read: [Backend Architecture](SKILL-backend-architecture.md) - Services & communication
3. Read: [Docker Deployment](SKILL-docker-deployment.md) - Set up local environment
4. Action: `npm run docker:up` - Get services running

### Day 2: Architecture Deep Dive

1. Read: [CQRS Pattern](SKILL-cqrs-pattern.md) - How business logic works
2. Read: [Database Management](SKILL-database-management.md) - Data layer
3. Explore: `/src/core-service/` - See CQRS in action
4. Action: Run a test query

### Day 3: Advanced Topics

1. Read: [Authentication & Sessions](SKILL-authentication.md) - User management
2. Read: [Notifications & Integrations](SKILL-notifications.md) - External APIs
3. Explore: Postman collection for API testing
4. Action: Try creating a test feature

---

## 🤝 Contributing to Documentation

Found a bug in the docs? Want to improve a skill?

1. **Open an issue** in the repository
2. **Reference the skill** (e.g., "SKILL-database-management.md")
3. **Suggest improvement** with specific section
4. **Submit PR** with changes

**Skills are living documents** - they improve as the project evolves!

---

## 📞 Getting Help

1. **Check the skill** for your technology
2. **Search the skill** (Ctrl+F) for your keyword
3. **Review examples** in the skill
4. **Check troubleshooting** section
5. **Review [Known Issues](README.md#-known-issues)** for blockers
6. **Check [TODO.md](TODO.md)** for planned fixes

---

## 🚀 Ready to Start?

Pick your task:

- [Build a feature →](SKILL-cqrs-pattern.md)
- [Work with database →](SKILL-database-management.md)
- [Set up auth →](SKILL-authentication.md)
- [Send notification →](SKILL-notifications.md)
- [Debug/Troubleshoot →](SKILL-docker-deployment.md#troubleshooting)

**Happy coding! 🎉**
