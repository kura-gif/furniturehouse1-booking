import type { FirebaseApp } from 'firebase/app'
import type { Firestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'
import type { FirebaseStorage } from 'firebase/storage'

declare module '#app' {
  interface NuxtApp {
    $firebase: FirebaseApp | null
    $db: Firestore | null
    $auth: Auth | null
    $storage: FirebaseStorage | null
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebase: FirebaseApp | null
    $db: Firestore | null
    $auth: Auth | null
    $storage: FirebaseStorage | null
  }
}

export {}
