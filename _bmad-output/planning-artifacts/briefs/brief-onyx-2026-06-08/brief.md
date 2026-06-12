---
title: "Product Brief: ONYX"
status: draft
created: 2026-06-08
updated: 2026-06-08
---

# Product Brief: ONYX

## Executive Summary

ONYX is a unified workout and nutrition orchestrator — one premium app where planning, logging, tracking, and analytics live together, built for people who train with purpose and eat real food.

Fitness apps today are fragmented and expensive. MyFitnessPal handles calories but ignores workouts, and its database assumes a Western diet. ChatGPT can write a routine but has no memory of your equipment, your history, or your body. The result: users juggle multiple tools, pay multiple subscriptions, and still never see a complete picture of their progress.

ONYX solves this by bringing everything under one roof. AI-powered planning (via Google Gemini) transforms natural language inputs into structured weekly workout and meal plans — and because it knows your history, every generation builds on the last. Manual planning gives full control, with saved exercise templates and a personal meal database that grows with the user. Progress tracking unifies weight, lifts, calories, and macros with rich analytics and auto-progression. The experience is wrapped in a minimalist dark interface that feels premium without being flashy, works offline-first as a PWA, and is free now with a subscription path later. Built first for the founder and friends — designed to scale if the product proves itself.

## The Problem

Fitness tracking and planning today are fragmented, expensive, and built for a one-size-fits-all world.

Existing apps like MyFitnessPal work well enough — if you eat Western food, can afford the subscription, and only need calorie counting. For anyone outside that mold, the experience collapses. Algerian meals and local ingredients are absent from databases, forcing users to manually enter everything with no reliable macro data. The result: most people either guess, skip logging altogether, or abandon the app.

Workout planning has the same problem. Generic AI tools like ChatGPT can generate a routine, but they have no memory — no knowledge of your equipment, your injury history, your past sessions, or your progression. Every conversation starts from zero. And workout and nutrition live in completely separate worlds: your meal log in one app, your lifting numbers in another, your progress photos nowhere at all. There's no unified picture of your fitness.

The cost of this fragmentation is real. Users waste time duplicating data, miss insights because no app connects the dots, and eventually disengage because the friction outweighs the benefit. What should be a motivating, data-rich feedback loop becomes a chore.

## The Solution

ONYX is a unified workout and nutrition orchestrator — one app where planning, logging, tracking, and analytics live together.

After a brief onboarding that establishes goals, weight, and caloric targets, users enter a dark, premium dashboard. From there, everything radiates:

**AI-Generated Plans.** The user describes their intent in natural language — preferred equipment, muscle groups, workout duration, training split, ingredients they love and those they avoid. Gemini transforms this into a structured weekly plan with workouts and meals calibrated to their goals. Because ONYX knows the user's history, every generation builds on the last — no more starting from scratch.

**Manual Planning, Fully Flexible.** Users can build workouts and meal plans by hand, or edit anything the AI generates. Exercises are saved as templates (name, sets, reps, rest) for reuse. Meals are logged from a growing personal database, with full macro editing. Weekly and daily views give full control.

**Unified Progress Tracking.** Weight, lifts, calories, protein, and all macros in one place — no switching apps. Auto-progression adjusts weights based on logged performance. Detailed workout history and rich stats connect the dots: lift progression over time, calorie trends, weekly protein adherence, and deeper analytics that answer real questions about what's working.

**Built for Real Eating.** ONYX doesn't assume a Western diet. Users log the meals they actually eat — Algerian and beyond — with a flexible database that grows with them.

**Offline-First PWA.** Works on mobile and desktop, with offline support so logging never depends on connectivity. The interface is minimal, high-end, and dark — the app feels as premium as the training it enables.

## What Makes This Different

- **Truly all-in-one.** Workout planning, meal logging, progress tracking, and analytics in a single app — not three subscriptions stitched together.
- **AI that remembers you.** Unlike ChatGPT or generic AI tools, ONYX knows your history, your equipment, your body. Every generation builds on context, not a blank chat.
- **Built for real food cultures.** No Western-food assumptions. ONYX is designed from day one for cuisines that existing databases ignore — Algerian meals, local ingredients, home cooking.
- **Premium feel, no bloat.** Stealth-wealth dark interface, minimal by design. The app respects the user's attention — it doesn't beg for engagement or upsell every screen.
- **Offline-first by architecture.** Logging a meal or finishing a workout never requires a signal bar. Syncs when connected, works when not.
- **Free now, subscription-ready later.** Built for the founder and friends first — free by default. When (and if) the product scales, a subscription model can be introduced; the architecture won't prevent it.

## Who This Serves

**Primary users.** The founder and their friends — people who train seriously, eat real food (Algerian, home-cooked, local ingredients), and want one app that connects workout planning, nutrition logging, and progress tracking without paying a subscription. They're frustrated by apps built for Western diets and generic AI that doesn't know them.

**Secondary (future).** Anyone who wants a premium, unified fitness app without the bloat or the cost. People who cook their own food and need flexible logging — not barcode scanning of packaged products. Athletes and gym-goers who want real analytics, not just a calorie counter.
## Success Criteria

- **Daily active use.** You and your friends are logging workouts and meals consistently — at least 4 days per week.
- **AI plans are useful.** AI-generated workout and meal plans are used as-is or with minor edits at least 70% of the time — not completely rewritten.
- **Tracking stickiness.** Users are still logging after 30 days. The app becomes the default place for fitness data, not a trial.
- **Stats that inform.** Users can point to a stat or insight from ONYX that changed how they train or eat.
- **Offline reliability.** Logging works without internet. No data loss on sync.
- **Future-ready.** The architecture supports adding a subscription model without a rewrite.
## Scope

**In for v1:**
- User onboarding (goals, weight, caloric targets)
- AI-generated weekly workout plans (equipment, muscle groups, duration, schedule)
- AI-generated weekly meal plans (preferred ingredients, excluded ingredients, goal macros)
- Manual workout builder (exercise name, sets, reps, rest) with saved templates
- Manual meal logging with personal database and full macro editing
- Unified progress tracking (weight, lifts, calories, protein, macros)
- Auto-progression based on logged performance
- Workout history and stats dashboard
- Supabase auth and profile management
- PWA with offline support
- Mobile-first responsive design (works on desktop too)
- Dark, premium interface

**Explicitly out of v1:**
- Barcode scanning
- Wearable/Apple Health integration
- Social features (sharing, leaderboards, challenges)
- Pre-built meal database (users build their own)
- Coaching/training plans from real human coaches
- Payment/subscription system
- iOS/Android native apps (PWA only)
- Progress photo uploads
- Workout video playback
- Multi-language support
- Public API
- Meal photo recognition (AI from image)
- Integration with gym equipment / smart devices
- Community recipes or shared meal database
- Personal trainer marketplace
- Gamification (streaks, badges, etc.)

## Vision

ONYX starts as a personal tool — built for the founder and friends. If it proves itself, it becomes something bigger.

In 2-3 years, ONYX could be the go-to fitness platform for people who cook real food, train with purpose, and want data that actually helps — not noise. A meal database that grows with its users, enriched by the community. AI that knows you better than any generic chatbot because it has your full history: every workout, every meal, every progression curve.

The interface stays premium and minimal. The analytics get deeper. The AI gets smarter. But the core never changes: one app, unified, offline-first, built for the way people actually eat and train.
