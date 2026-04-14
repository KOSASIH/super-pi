# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| v3.x    | ✅ Active security support |
| v2.x    | ⚠️ Critical fixes only |
| v1.x    | ❌ No longer supported |

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

**Email:** security@super-pi.io  
**PGP Key:** [Download](https://keys.openpgp.org/search?q=security@super-pi.io)  
**Response SLA:** 24 hours for acknowledgment, 72 hours for assessment

### What to Include

1. Description of the vulnerability
2. Affected component (contract, package, L2 node, etc.)
3. Steps to reproduce
4. Potential impact assessment
5. Suggested fix (optional but appreciated)

## Severity Classification

| Severity | Description | Response |
|----------|-------------|----------|
| **Critical** | Loss of funds, mint without collateral, taint bypass | <24h patch |
| **High** | Privilege escalation, oracle manipulation, bridge exploit | <72h patch |
| **Medium** | DoS, griefing, fee manipulation | <7 days |
| **Low** | Information disclosure, cosmetic issues | <30 days |

## Security Architecture

### Smart Contracts
- OpenZeppelin v5 battle-tested libraries
- ReentrancyGuard on all state-changing functions
- AccessControl RBAC (not single-owner Ownable)
- Pausable emergency stop on all critical contracts
- Custom errors (no string revert reasons — gas efficient + no info leak)
- Formal verification via ARCHON Forge agent

### Taint System
- Permanent on-chain blacklist — cannot be overwritten
- Evidence hashes stored for auditability
- AI oracle batch updates for exchange address tracking
- 10-hop transaction tracing to catch indirect taint

### L2 Bridge
- Post-quantum security: Kyber-1024 KEM + Falcon-512 signatures
- ZK proofs for state transition validity (Plonky3 STARK)
- 7-day fraud proof window for optimistic rollup
- Multi-sig threshold for bridge withdrawals

### NEXUS Prime Veto Hierarchy
Any of the following agents can halt the entire pipeline:
1. SAPIENS Guardian (fraud, riba, Pi Coin detection)
2. LEX Machina (compliance violation)
3. ARCHON Forge (formal verification failure)

### CI/CD Security
- CodeQL static analysis on every PR
- Gitleaks secret scanning on every push
- Slither Solidity analyzer (fail-on: HIGH)
- Trivy container vulnerability scanning
- cargo-audit + cargo-deny for Rust dependencies
- npm audit for Node.js dependencies

## Bug Bounty

| Finding | Reward |
|---------|--------|
| Critical smart contract bug | Up to $50,000 SPI |
| High severity | Up to $10,000 SPI |
| Medium severity | Up to $2,000 SPI |
| Low severity | Up to $500 SPI |

Rewards paid in $SPI at $314,159 peg value.

## Known Non-Issues

- Chainlink oracle staleness (>1h) intentionally reverts — this is a safety feature
- Daily mint limits per address — intentional design, not a DoS vulnerability
- Pi Coin integration always reverts — this is permanent by design
