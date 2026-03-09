# MonAmiChef

An AI-powered culinary assistant that helps you discover recipes, plan meals, and manage your grocery shopping — all through a conversational interface.

## What it does

**Chat with an AI chef.** Describe what you want to cook — "quick high-protein dinner", "vegetarian pasta", "something with the chicken and spinach I have" — and the AI generates a complete recipe tailored to your request. You can set dietary preferences and exclusions before you start.

**Save and organize recipes.** Recipes you like go into your personal library. From there you can adjust servings, mark favorites, and navigate back to full details (ingredients, steps, macros) at any time.

**Build your grocery list automatically.** Add a recipe to your grocery list and its ingredients are merged in, categorized by supermarket section (produce, meat, dairy, pantry, etc.). Check items off as you shop. The list stays linked to its source recipes so you always know what you're buying and why.

**Ask for culinary advice.** Beyond recipe generation, the assistant can suggest ingredient substitutions, explain techniques, and answer general cooking questions.

## Features

- Conversational recipe generation via Google Gemini AI
- Dietary filters: vegetarian, vegan, gluten-free, dairy-free, high-protein, and more
- Recipe details: ingredients with quantities, step-by-step instructions, macros (calories, protein, carbs, fat)
- Servings adjuster with automatic quantity scaling
- Favorites with animated heart toggle
- Smart grocery list: merged ingredients, category grouping, per-recipe breakdown, check-off state
- Multi-language support (i18n)

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native + Expo (iOS / Android) |
| Routing | Expo Router (file-based, drawer navigation) |
| UI | Gluestack UI, NativeWind (Tailwind CSS) |
| Server state | TanStack React Query |
| Animations | React Native Reanimated |
| Backend | NestJS (TypeScript) |
| Database | PostgreSQL via Prisma ORM |
| Auth & hosting | Supabase |
| AI | Google Gemini (Flash) |

## Project structure

```
MonAmiChef/
├── mobile/          # Expo React Native app
│   └── app/
│       ├── (auth)/          # Login / register screens
│       └── (main)/
│           ├── chat/        # AI chat interface
│           ├── recipe-details/  # Full recipe view
│           ├── recipes/     # Saved recipes & favorites
│           └── groceries/   # Shopping list
└── backend/         # NestJS API server
    └── src/
        ├── ai-assistant/    # Gemini integration
        ├── chat-sessions/   # Conversation management
        ├── recipes/         # Recipe storage
        ├── saved-recipes/   # User library & favorites
        ├── groceries/       # Shopping list logic
        └── parse-groceries/ # AI ingredient parsing
```

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or a Supabase project)
- Google Gemini API key
- Expo Go app (for mobile development)

### Backend

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, GEMINI_API_KEY, SUPABASE_* vars
npm install
npx prisma migrate dev
npm run start:dev
```

### Mobile app

```bash
cd mobile
cp .env.example .env   # fill in EXPO_PUBLIC_API_URL, SUPABASE_* vars
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` to open in an iOS / Android simulator.
