# Hydrogen + Vite playground

## Getting started

```shellscript
pnpm install
pnpm run dev
```

## Technologies

### Remix + Vite

This app has been built with Remix to be as close to an original Hydrogen app as possible. Vite is also used to speed up the build process.

### Hydrogen

Hydrogen is used for generating Shopify types but also to import components such as `<Image />` or `<Money />`.

### Radix UI + shadcn/ui

Radix UI is used along with shadcn/ui to implement the UI and make sure components are accessible across the app.

### Tailwind CSS

Tailwind CSS is used to style the app.

### Development Assumptions

This app is for demo purposes. It is not intended to be used in production.

For the sake of the demo, this app mocks an API call to dynamically fetch Shopify products.

Product filtering, pagination, sorting and search are implemented in the server side. In a real world scenario, these functionnalities would be managed with Shopify GraphQL queries.

States are stored in the url and persisted between page loads.

The Infinite Scrolling functionnality uses an artificial delay of 1 seconds to simulate a real world scenario.
