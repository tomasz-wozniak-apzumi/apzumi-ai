# Project Glossary

Domain-specific terminology used in this application. Reference this when you encounter unfamiliar terms.

---

## Domain Terms

| Term        | Definition                                                        | Usage                                             |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| **Domain**  | A logical grouping of related functionality (auth, api, database) | "The auth domain handles all authentication"      |
| **Context** | Documentation that provides AI with project understanding         | "Include relevant context before generating code" |

## Technical Terms

| Term        | Definition                              | Not to be confused with                |
| ----------- | --------------------------------------- | -------------------------------------- |
| **Handler** | HTTP request handler (controller layer) | Service (business logic layer)         |
| **DTO**     | Data Transfer Object for API boundaries | Domain Model (internal representation) |

## Project-Specific Terms

| Term        | Meaning in this project                              |
| ----------- | ---------------------------------------------------- |
| **Profile** | Extended user information (bio, avatar, preferences) |
| **PLive**   | The Pritikin-operated portal (virtual care delivery) |

## Acronyms & Abbreviations

| Acronym  | Full Form                        | Context                                      |
| -------- | -------------------------------- | -------------------------------------------- |
| **ITP**  | Individual Treatment Plan        | A patient's personalized care/treatment plan |
| **CR**   | Cardiac Rehabilitation           | An episode of care type                      |
| **ICR**  | Intensive Cardiac Rehabilitation | A more intensive episode of care type        |
| **EHR**  | Electronic Health Record         | Used in billing/encounter contexts           |
| **MRN**  | Medical Record Number            | Patient identifier                           |
| **SSO**  | Single Sign-On                   | Identity provider configuration              |
| **OIDC** | OpenID Connect                   | Authentication protocol                      |
| **BMI**  | Body Mass Index                  | Observation/vital                            |

## Status Values

| Status      | Meaning                               | Valid transitions         |
| ----------- | ------------------------------------- | ------------------------- |
| `active`    | Normal operational state              | → `inactive`, `suspended` |
| `inactive`  | User-initiated deactivation           | → `active`                |
| `suspended` | Admin-initiated restriction           | → `active`                |
| `deleted`   | Soft-deleted, not recoverable by user | (terminal)                |

## Error Code Prefixes

| Prefix  | Domain                 | Example              |
| ------- | ---------------------- | -------------------- |
| `AUTH_` | Authentication errors  | `AUTH_INVALID_TOKEN` |
| `USER_` | User management errors | `USER_NOT_FOUND`     |
| `SYS_`  | System/internal errors | `SYS_INTERNAL_ERROR` |
