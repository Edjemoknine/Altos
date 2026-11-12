"use client";

import { useMutation } from "@tanstack/react-query";
import {
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from "./auth-service";

export function useSignInMutation() {
  return useMutation({ mutationFn: signInWithEmail });
}

export function useSignUpMutation() {
  return useMutation({ mutationFn: signUpWithEmail });
}

export function useSignOutMutation() {
  return useMutation({ mutationFn: signOut });
}
