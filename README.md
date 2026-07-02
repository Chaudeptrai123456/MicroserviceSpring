# MICROSERVICES E-COMMERCE SYSTEM ARCHITECTURE

A production-grade, distributed e-commerce platform built on a highly available microservices architecture. The system is designed to handle high-concurrency traffic, enforce enterprise-level security, and facilitate seamless cloud deployment.

---

## Architectural Design Goals

* **Independent Scalability:** Enables individual microservices to scale out horizontally based on real-time traffic demands without affecting other system components.
* **High Availability & Fault Isolation:** Implements decentralized patterns to isolate localized failures, preventing a single point of failure (SPOF) from cascading across the system.
* **Loose Coupling:** Enforces a strict separation of concerns among the Frontend, API Gateway, Backend Microservices, and AI/Embedding services.

---

## Project Directory Structure

```text
.
├── backend/                    # Core Java Spring Boot microservices
├── gateway/                    # API Gateway for routing and security enforcement
├── ecommerce-ui/               # Frontend Client Application (User Interface)
├── node-server/                # Node.js server for real-time WebSocket communication
├── python-embedding-server/    # Python server for AI and high-dimensional embeddings
└── README.md
```

---

## System Component Specifications

### 1. API Gateway (`gateway/`)
Acts as the single entry point for all client requests, executing critical cross-cutting concerns:
- **Dynamic Routing:** Forwards incoming client requests to their respective downstream microservices.
- **Centralized Management:** Enforces unified security policies, JWT verification, rate limiting, and centralized request logging.

### 2. Frontend Client (`ecommerce-ui/`)
A responsive user interface optimized for shopping experiences, featuring streamlined checkout flows and automated invoice generation.

### 3. Real-Time & Task Server (`node-server/`)
An auxiliary Node.js server optimized for high-concurrency, asynchronous operations:
- Low-latency real-time communications via WebSockets (e.g., live chat).
- File system operations, including secure image uploads for product catalogs.

### 4. AI & Embedding Server (`python-embedding-server/`)
A specialized Python-based microservice handling vector operations:
- Generating mathematical vector embeddings of product descriptions.
- Powering high-speed semantic search and recommendation engine models.

---

## Core Backend Microservices (`backend/`)
The backend is built with Java and Spring Boot, utilizing the microservices pattern to ensure independent deployability and modular business boundaries.

### Command/Write Service (CQRS Pattern)
- Adheres to the Command Query Responsibility Segregation concept by handling all state-changing write operations.
- Processes validation and normalization of incoming transaction requests.
- Publishes Domain Events to Apache Kafka to synchronize state changes across secondary services.

### Authentication Service (Spring Security & Google OAuth2)
- Centralizes identity management and integrates with third-party providers (Google Identity Platform).
- Generates and verifies stateless JWT tokens (Access and Refresh Tokens).
- Enforces Role-Based Access Control (RBAC).
- Features built-in defenses: Automated account lockout policies during brute-force detection and encrypted password recovery workflows.

### Inventory Service
- Tracks real-time stock levels across all catalogs.
- Executes temporary **Stock Reservations** during checkout to eliminate risk of over-selling.
- Synchronizes inventory levels dynamically based on the final order transaction states.

### Order Service
- Manages the transactional state machine of orders (PENDING -> PAID -> SHIPPED -> COMPLETED).
- Coordinates automated payment settlements, order cancellation, and immediate stock release policies upon timeout.

### User & Role Service
- Governs strict system access boundaries using RBAC:
    - **Owner:** Unrestricted access to system-wide configurations and high-level administrator/manager provisioning.
    - **Manager:** Authorized to administer catalogs, monitor inventory levels, and generate sales analytics.
    - **Admin:** Handles day-to-day operations, resolves transaction exceptions, and manages standard user accounts.
    - **User:** Customer-facing permissions, including catalog browsing, cart operations, and order tracking.

---

## Infrastructure & Performance Optimization

### Asynchronous Event Brokerage (Apache Kafka)
- Acts as the distributed event backbone of the system.
- Decouples transactional dependencies (e.g., separating Order Service from Inventory Service), facilitating **Eventual Consistency**.
- Absorbs traffic spikes, guaranteeing stable throughput under high loads.

### Distributed Caching & Locking (Redis)
- Implements an in-memory caching layer for high-read catalog queries, reducing primary database load.
- Leverages **Redis Distributed Locks** to securely manage stock reservations, eliminating race conditions during high-concurrency checkout events.

### Resilient Self-Healing (Circuit Breaker)
- Isolates downstream service failures automatically to prevent cascading outages across the cluster.
- Integrates fallback mechanisms to gracefully degrade system functionalities, maintaining baseline application availability.

---

## Key Technical Highlights

* **Standard Microservices Architecture:** Implements API Gateway, Service Discovery, and highly decoupled service boundaries.
* **Advanced Database Design:** Supports Read/Write Splitting with PostgreSQL Master-Slave replication patterns.
* **Enterprise-Grade Security:** Leverages Spring Security, Google OAuth2, JWT, and fine-grained RBAC.
* **Distributed Infrastructure:** Built with Kafka for event brokerage, Redis for caching and concurrency control, and Circuit Breakers for resilience.
* **DevOps & Production-Ready:** Fully containerized and orchestrated using Docker and Kubernetes Ingress routing.
