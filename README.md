# Doctors for Home 🏠💊

A modern, responsive landing page for the **Doctors for Home** platform — certified physician home visits, built with **Next.js 15 + Tailwind CSS**.

## ✨ Features

- 🏠 Hero section with animated doctor card & trust badges
- 🗓️ Prominent "Book a Home Visit" CTA with pulse animation
- 📊 Stats strip (500+ doctors, 50K+ visits, 4.9★, 24/7)
- 🩺 Top 3 specialized services: General Physician, Pediatrics, Cardiology
- 📣 CTA banner with gradient background
- 🔗 Responsive Navbar with mobile hamburger menu
- 🦶 Full footer with link columns
- 🎨 Clean medical theme: white · light blue · green

## 🗂️ Folder Structure

```
doctors-for-home/
├── src/
│   ├── app/
│   │   ├── globals.css        ← Tailwind base + custom animations
│   │   ├── layout.tsx         ← Root layout with metadata
│   │   └── page.tsx           ← Landing page (composes all sections)
│   └── components/
│       ├── Navbar.tsx         ← Sticky nav with mobile menu
│       ├── HeroSection.tsx    ← Hero + Book CTA + doctor card
│       ├── StatsStrip.tsx     ← Animated stats band
│       ├── ServicesSection.tsx← 3 service cards (data-driven)
│       ├── CtaBanner.tsx      ← Gradient CTA section
│       └── Footer.tsx         ← Full footer
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── next.config.ts
```

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

| Tool | Version |
|------|---------|
| Next.js | 15.0.3 (App Router) |
| React | 18 |
| TypeScript | 5 |
| Tailwind CSS | 3.4 |

## 🎨 Color Palette

| Color | Use |
|-------|-----|
| `blue-900` (`#1e3a5f`) | Headings, navy navy backgrounds |
| `blue-500` (`#3b82f6`) | Buttons, icons, accents |
| `green-500` (`#22c55e`) | CTA buttons, success, trust marks |
| `sky-50` / `blue-50` | Section backgrounds |
| White | Cards, Navbar |
