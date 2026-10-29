# John Doe
Austin, TX | Open to Remote | +1 415 555 0142 | john.doe@example.com | linkedin.com/in/johndoe | github.com/johndoe

## WORK EXPERIENCE

### **Senior Software Engineer** | Northwind Payments — Austin, TX (Remote)
*March 2022 – Present*
- Reduced p95 checkout latency from 840ms to 210ms by caching idempotency lookups in Redis and moving fraud scoring off the request path with a Kafka event-driven worker.
- Processed 4.2M monthly transactions across 3 payment providers by designing distributed systems and Java 17 / Spring Boot microservices with retries, dead-letter queues, and exactly-once ledger writes.
- Led a 5-engineer squad through a zero-downtime PostgreSQL 13 to 16 migration with a dual-write adapter, backfill tooling, and high-availability rollback runbooks.
- Raised service coverage from 41% to 86% by introducing contract tests with Testcontainers and blocking merges on flaky-test and mutation-score checks in CI/CD pipelines.
- Owned API design, performance optimization, and stakeholder management for the settlement domain, aligning finance, support, and product on 12 REST API contracts.

### **Software Engineer** | Lumen Health — Chicago, IL
*June 2020 – March 2022*
- Shipped a patient scheduling REST API used by 120 clinics, handling 900K requests/day with Spring Boot, PostgreSQL, and AWS ECS while maintaining 99.95% uptime through load balancing and automated failover.
- Reduced no-show rate 18% by building a Twilio and SendGrid notification pipeline that reacted to appointment changes within 30 seconds.
- Automated HIPAA audit evidence collection with Python and AWS Lambda, replacing a 6-hour monthly manual review with a 15-minute job.
- Mentored 3 junior engineers, ran weekly code review sessions, and introduced trunk-based development, shrinking pull-request cycle time from 3.1 days to 9 hours.

### **Junior Backend Developer** | Bitwise Labs — Remote
*July 2019 – June 2020*
- Built 14 REST endpoints for a logistics dashboard with Node.js, Express, and MongoDB, serving 25K monthly active users.
- Eliminated 70% of duplicate support tickets by adding validation, structured error codes, and request tracing to the shipment API.

## TECHNICAL SKILLS
- **Languages:** Java (11, 17), Python 3, TypeScript, SQL, Bash
- **Frameworks:** Spring Boot, Spring MVC, Hibernate/JPA, Node.js, Express, React.js, REST APIs, Microservices
- **Cloud & Infrastructure:** AWS (ECS, Lambda, SQS, S3, RDS), Docker, Kubernetes, Terraform, GitHub Actions, CI/CD
- **Observability:** Prometheus, Grafana, OpenSearch, structured logging, distributed tracing
- **Databases & Tools:** PostgreSQL, Redis, MongoDB, Kafka, Git, Agile/Scrum, Jira

## PROJECTS
### **ledger-replay** | [github.com/johndoe/ledger-replay](https://github.com/johndoe/ledger-replay)
- Built an open-source CLI that replays payment events into a local PostgreSQL instance, used by 40+ developers to reproduce settlement bugs in under 2 minutes.

## EDUCATION
**B.S. in Computer Science** | University of Illinois Chicago — *2019*

## CERTIFICATIONS
AWS Certified Solutions Architect – Associate — Amazon Web Services | Confluent Certified Developer for Apache Kafka
