# Testing Guide

## Local setup
- Copy .env.local.example to .env.local and fill values
- npm run dev

## Auth
- Create a user in Supabase, confirm, log in at /login
- Verify middleware redirects unauthenticated users

## AI Generation
- POST /api/ai/generate and use dashboard forms
- With OPENAI_API_KEY set, verify on-brand content

## Optimization & Compliance
- Insert optimization_configs and compliance_rules
- Test /api/optimize/apply and /api/compliance/check

## A/B Testing
- POST /api/abtest/create, then POST /api/abtest/result

## Images
- Use Images card on dashboard or POST /api/images/generate

## Collaboration & Versions
- Use /editor: save versions, list, revert

## Performance Learning
- Submit feedback on Generate card and verify learned_tips are used
