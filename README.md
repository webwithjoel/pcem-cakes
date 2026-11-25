# Pcemcakes

A mobile-first shop preview for PCEM: Paramount Cakes and Events Management.

## Requirements

- Node.js 20
- pnpm

## Commands

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm test:pricing
pnpm check
```

`pnpm test:pricing` runs unit checks against the sample pricing examples.

The supplied image assets live in `images/`. Vite serves them at `/images/` during development and copies them into `dist/images/` when building.

Event plans are saved in the browser's local storage. Product customisation and the event planner provide local cart estimates; checkout and order submission are not connected yet.
