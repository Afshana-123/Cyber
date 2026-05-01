# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Name

**ChainTrust** (working name)
Blockchain-based Public Fund Tracking & Fraud Detection Platform

---

## 1. Overview

ChainTrust is a web platform that enables transparent, tamper-proof tracking of public funds from allocation to final usage. It combines blockchain-based logging with rule-based fraud detection and role-based access for administrators, auditors, and the public.

The system ensures:

* End-to-end visibility of fund flow
* Detection of suspicious activities
* Public accountability and trust

---

## 2. Problem Statement

Public funds often lack transparency and are vulnerable to:

* Corruption in tender allocation
* Overpricing and collusion
* Misuse of funds during execution
* Lack of public visibility

Current systems are:

* fragmented
* opaque
* manually audited
* easy to manipulate

---

## 3. Goals & Objectives

### Primary Goals

* Provide **tamper-proof tracking** of funds
* Enable **real-time fraud detection**
* Offer **multi-role access** (Admin, Auditor, Public)
* Deliver a **high-impact demo in 24 hours**

### Success Criteria

* Fully functional interactive dashboard
* Fraud detection logic working with explanations
* Role-based views operational
* Smooth demo flow (3–5 minutes)

---

## 4. Target Users

### 1. Admin (Government Authority)

* Create and manage projects
* Approve tenders
* Monitor system-wide metrics

### 2. Auditor (Oversight Authority)

* Investigate flagged transactions
* View detailed logs and evidence
* Analyze fraud patterns

### 3. Public (Citizens)

* View project progress
* Track fund usage
* Access transparency scores

---

## 5. Key Features

### 5.1 Dashboard

* Total funds tracked
* Active projects
* Flagged transactions
* System risk score

---

### 5.2 Project & Tender Management

* Create project with budget
* Submit bids (mock)
* Store bid hashes (blockchain simulation)
* Multi-signature approval system

---

### 5.3 Fraud Detection Engine (Rule-Based)

#### Detection Rules:

* Similar bid values (collusion)
* Bids above benchmark (overpricing)
* Repeated contractor wins

#### Output:

* Risk score (0–100)
* Explanation ("Flagged because...")

---

### 5.4 Transaction Tracking

* Simulated fund flow:
  Government → Contractor → Vendor → Worker
* Transaction logging
* Status: Verified / Flagged

---

### 5.5 Blockchain Layer

* Smart contract functions:

  * registerProject
  * submitBid (hashed)
  * approveWinner
* Immutable logging of key actions

---

### 5.6 Auditor Panel

* Full transaction logs
* Fraud explanations
* Evidence trail

---

### 5.7 Public Transparency View

* Project summary
* Fund usage breakdown
* Transparency score

---

## 6. User Flows

### Admin Flow

1. Create project
2. Add budget
3. Receive bids
4. Approve winner (multi-sig)
5. Monitor transactions

---

### Auditor Flow

1. View flagged transactions
2. Analyze risk score
3. Inspect fraud reasons
4. Review logs

---

### Public Flow

1. Browse projects
2. View fund allocation
3. Check transparency score
4. Track project progress

---

## 7. Functional Requirements

### Frontend

* Pixel-perfect UI from Stitch
* Role-based rendering
* Interactive dashboard
* Dynamic data binding

### Backend (Planned)

* API routes for:

  * projects
  * bids
  * transactions
  * fraud detection

### Blockchain

* Minimal smart contract
* Hash storage
* Multi-sig simulation

---

## 8. Non-Functional Requirements

* Fast loading UI
* Clean and intuitive UX
* Deterministic demo behavior
* No external API dependencies
* Runs locally without errors

---

## 9. Data Model (Simplified)

### Project

* id
* name
* budget
* status
* riskScore

### Bid

* id
* projectId
* contractor
* amount
* hash

### Transaction

* id
* from
* to
* amount
* status

### FraudAlert

* id
* projectId
* riskScore
* reason

---

## 10. MVP Scope (24-Hour Hackathon)

### Included

* Frontend dashboard (Admin, Auditor, Public)
* Mock data system
* Rule-based fraud detection
* Simulated blockchain interaction

### Excluded

* Real banking/GST APIs
* Real authentication
* Production database
* Advanced ML models

---

## 11. Future Scope

* Real blockchain deployment (Polygon/Hyperledger)
* AI/ML fraud detection models
* Integration with government APIs
* Mobile app version
* Real-time alerts

---

## 12. Risks & Mitigation

| Risk               | Mitigation              |
| ------------------ | ----------------------- |
| Overcomplexity     | Limit to MVP features   |
| Time constraint    | Frontend-first approach |
| Integration issues | Use mock data           |
| Blockchain delays  | Use fallback simulation |

---

## 13. Demo Plan (3–5 Minutes)

1. Show dashboard overview
2. Create a project
3. Simulate bids
4. Trigger fraud detection
5. Show flagged transaction
6. Switch roles (Admin → Auditor → Public)
7. Highlight transparency and trust

---

## 14. Tech Stack

* Frontend: Next.js + Tailwind CSS
* Backend: Next API routes
* Blockchain: Solidity + ethers.js
* Data: Mock JSON / in-memory

---

## 15. Key Differentiators

* End-to-end fund tracking
* Explainable fraud detection
* Multi-role transparency
* Clean, modern UI
* Real-world relevance

---

## 16. Vision Statement

To create a transparent, tamper-proof system where public funds can be tracked, verified, and trusted by everyone—from governments to citizens.
