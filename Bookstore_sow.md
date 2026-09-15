# Statement of Work — Bookstore App (Backend API)

## 1. Objective
A small, two-entity NestJS app (User + Book) that hits every core concept from the Q1 roadmap, kept simple enough to actually finish in 2 days and walk the lead through.

## 2. Stack
NestJS + TypeScript + TypeORM + SQLite + cookie-session — same pattern as car-managment, just a smaller domain.

## 3. Entities

| Entity | Fields | Relation |
|---|---|---|
| **User** | id, email, password, role (`admin` \| `user`) | 1–many → Book |
| **Book** | id, title, author, price, description, `addedBy` (User) | many–1 → User |

That's it — no third entity needed. Keeping it to two lets you show every relation type that matters (ManyToOne/OneToMany) without extra modules to build.

## 4. Concept Coverage

| Concept | Where it shows up |
|---|---|
| TypeScript fundamentals | typed entities, `Role` enum |
| Modules/Controllers/Services | `UsersModule`, `BooksModule` |
| Dependency Injection | repos → services → controllers |
| DTOs + validation | `create-book.dto`, `update-book.dto`, `create-user.dto` w/ class-validator |
| Auth | signup/signin, cookie-session, password hashing |
| Guards | `AuthGuard` (must be logged in), `AdminGuard` (only admin can add/delete books) |
| Interceptors | `SerializeInterceptor` (hide password in responses), `CurrentUserInterceptor` |
| Middleware | `CurrentUserMiddleware` |
| TypeORM relations | User ↔ Book (OneToMany/ManyToOne) |
| Exception handling | not-found + validation exception filter |
| Config | `ConfigModule`, `.env.dev` |
| Logging | simple request logger |
| Testing | one unit spec + one e2e spec, same as car-managment |

## 5. 2-Day Plan

**Day 1** — scaffold, TypeORM+SQLite config, User module + auth (signup/signin, guards, password hashing), Book module CRUD with DTOs + validation, wire the User↔Book relation.

**Day 2** — guards on write routes (admin-only add/edit/delete, anyone logged in can read), interceptors (hide password, attach current user), exception filter + logging pass, one unit test + one e2e test, README + demo run-through.

## 6. Demo Flow
Admin signs up → adds a few books → a regular user signs up, browses/searches books (read-only) → admin edits/deletes a book → password never shows up in any response.

## 7. Out of Scope
No frontend, no cart/checkout, no payments, no categories/search filters beyond basic listing — keeps it buildable in 2 days and easy to extend later if the lead wants more.
