# Development practices questions

Please provide thoughtful responses to the following questions. Your answers should demonstrate your understanding of modern development practices and architectural considerations.

## DevOps Practices

### 1. CI/CD Pipeline Design

**Question:** How do you design CI/CD pipelines for applications like this? What are your must-have checks?

**Your Answer:**

One pipeline for every change: build the same Docker images used in Compose, then run backend pytest, frontend unit tests, lint, and a TypeScript typecheck before anything lands on main.

On top of that Id add dependency scanning and container image scanning, with the build failing on critical issues. I’d only promote a build to production after CI has fully passed on main, and I’d ship it under a fixed image tag. Rollback is then straightforward.

### 2. Infrastructure as Code

**Question:** How would you approach infrastructure-as-code for deploying this project in a cloud environment?

**Your Answer:**

Describe networks, load balancers, DNS, secrets, and both services in Terraform (or the cloud vendor equivalent). Separate workspaces or state per environment.

Run backend and frontend as container tasks or pods behind HTTPS. For a real deployment I’d swap SQLite for a managed relational DB with backups and connection limits in the same modules, and pull secrets from a proper store instead of baking them into compose files.

### 3. Monitoring and Alerting

**Question:** What strategies do you recommend for monitoring and alerting in production?

**Your Answer:**

Logs should be easy to search and tied to a single request ID end to end. Expose straightforward health checks from Flask, and track whether the API is keeping up: traffic, error rate, and how slow responses are getting. For the frontend, I’d either run scripted checks against the main flows or use whatever real-user data the team already trusts.

Alert when something is critical (ex: error count above threshold, site down, etc.)

## Legacy Systems

### 4. Legacy Modernization

**Question:** Walk through your process for modernizing a legacy codebase with minimal disruption.

**Your Answer:**

First map the critical paths and add characterization tests so refactors don’t move behavior accidentally. Then use a strangler pattern to shrink legacy code over time.

Ship in small vertical slices, use feature flags when a cutover is risky, and where it helps, shadow or dual-run old vs new until you trust the new path—then retire the legacy route.

## Testing

### 5. Test Suite Organization

**Question:** What patterns and practices inform your test suite organization?

**Your Answer:**

Classic pyramid: lots of fast unit tests, fewer integration tests, and a thin E2E layer for the main user journeys.

## Architecture

### 6. Scaling Architecture

**Question:** What architectural choices would you make if tasked to scale this system for millions of daily active users?

**Your Answer:**

SQLite and a single Flask process will become a bottleneck quickly. I’d use a managed database with pooling, read replicas or caching for hot read heavy aggregates, and multiple stateless API instances behind a load balancer with autoscaling.

Serve the frontend from a CDN, add HTTP caching on safe read paths, and push heavy analytics or batch work onto a queue so request threads stay short.

## Opinion

### 7. Overrated Practice

**Question:** What's one commonly-used pattern/practice you think is overrated, and what alternative do you recommend?

**Your Answer:**

Spinning up microservices...

I’d start with a well-factored monolith or a small set of services, use modules and interfaces, and split services only when a piece has a distinct scaling profile, team, or release cadence that justifies the tax. Org size/structure is a major factor in this decision making process
