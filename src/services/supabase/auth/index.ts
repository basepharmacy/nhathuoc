import {
  ConfigureParams,
  GoogleSignin,
  SignInParams,
} from "@react-native-google-signin/google-signin"
import {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
} from "@supabase/supabase-js"
import * as AppleAuthentication from "expo-apple-authentication"
import { FamilyTaskSupabaseClient } from "../client"

type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void | Promise<void>

type AppleSignInOptions = AppleAuthentication.AppleAuthenticationSignInOptions

const createAuthClient = (client: FamilyTaskSupabaseClient) => ({
  async getUser(): Promise<User | null> {
    const result = await client.auth.getUser()
    if (result.error) throw result.error
    return result.data.user
  },

  async getSession(): Promise<Session | null> {
    const result = await client.auth.getSession()
    if (result.error) throw result.error
    return result.data.session
  },

  onAuthStateChange(callback: AuthStateChangeCallback): Subscription {
    const { data } = client.auth.onAuthStateChange(callback)
    return data.subscription
  },

  async signInAnonymously(): Promise<void> {
    const { error } = await client.auth.signInAnonymously()
    if (error) throw error
  },

  configureGoogleSignIn(options?: ConfigureParams) {
    GoogleSignin.configure(options)
  },

  async signInWithGoogle(options?: SignInParams): Promise<void> {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn(options)
    if (!userInfo.data?.idToken) throw new Error("No ID token present!")

    const { error } = await client.auth.signInWithIdToken({
      provider: "google",
      token: userInfo.data.idToken,
    })

    if (error) throw error
  },

  async signInWithApple(options?: AppleSignInOptions): Promise<void> {
    const credential = await AppleAuthentication.signInAsync(options)
    if (!credential.identityToken) throw new Error("No identityToken.")

    const { error } = await client.auth.signInWithIdToken({
      provider: "apple",
      token: credential.identityToken,
    })

    if (error) throw error
  },

  async linkingWithGoogle(options?: SignInParams): Promise<void> {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn(options)
    if (!userInfo.data?.idToken) throw new Error("No ID token present!")

    const { error } = await client.auth.linkIdentity({
      provider: "google",
      token: userInfo.data.idToken,
    })

    if (error) throw error
  },

  async linkingWithApple(options?: AppleSignInOptions): Promise<void> {
    const credential = await AppleAuthentication.signInAsync(options)
    if (!credential.identityToken) throw new Error("No identityToken.")

    const { error } = await client.auth.linkIdentity({
      provider: "apple",
      token: credential.identityToken,
    })

    if (error) throw error
  },


  async signOut(): Promise<void> {
    const { error } = await client.auth.signOut()
    if (error) throw error
  },
})

export { createAuthClient }
export type { AuthStateChangeCallback }
