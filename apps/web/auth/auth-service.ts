import { authClient } from "./auth-client";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = SignInInput & {
  name: string;
};

export async function signInWithEmail(input: SignInInput) {
  const { data, error } = await authClient.signIn.email({
    ...input,
    callbackURL: "/dashboard",
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signUpWithEmail(input: SignUpInput) {
  const { data, error } = await authClient.signUp.email(input);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const { data, error } = await authClient.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
