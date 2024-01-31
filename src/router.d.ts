import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // is optional
    allowedRoles?: string[]
  }
}

// To ensure it is treated as a module, add at least one `export` statement
export {}
