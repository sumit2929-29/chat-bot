# AI-Powered Client Support Chatbot --- Project Documentation

This folder contains the project planning and engineering documents.

## Documents

1.  [01 --- Product Requirements Document](01-PRD.md)
2.  [02 --- Technical Requirements Document](02-TRD.md)
3.  [03 --- Web Flow, Features & Navigation Logic](03-WEB-FLOW.md)
4.  [04 --- UI/UX Design Brief](04-UI-UX-DESIGN-BRIEF.md)
5.  [05 --- Backend Database Schema & API Design](05-BACKEND-SCHEMA.md)
6.  [06 --- Implementation Plan](06-IMPLEMENTATION-PLAN.md)

## Agreed architecture baseline

-   Frontend: Next.js + React
-   Backend API: Node.js + Express.js
-   Database: Supabase PostgreSQL
-   AI orchestration / RAG: Dify
-   Model: Gemini configured in Dify

The original project kickoff brief listed Next.js API Routes for
backend. The team has since selected a separate Express backend. These
documents preserve the required product behavior and endpoints while
reflecting that team decision.

## Important decisions before production

-   Select email OTP or secure guest-session authentication.
-   Confirm Dify Chatflow/Chat vs Workflow application type.
-   Approve consent wording, retention, and deletion process.
-   Finalize RLS policies and test cross-client isolation.
-   Keep all privileged keys server-side.

These documents are a draft baseline and should be reviewed by the team
lead, product owner, and security owner before production
implementation.
