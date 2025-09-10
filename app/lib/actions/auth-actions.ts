"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginFormData, RegisterFormData } from "../types";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

// Result types for better type safety
type AuthResult = {
  success: boolean;
  error?: string;
  user?: any;
  session?: any;
};

export async function login(data: LoginFormData): Promise<AuthResult> {
  try {
    // Validate input
    const validationResult = loginSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: validationResult.data.email,
      password: validationResult.data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function register(data: RegisterFormData): Promise<AuthResult> {
  try {
    // Validate input
    const validationResult = registerSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: validationResult.data.email,
      password: validationResult.data.password,
      options: {
        data: {
          name: validationResult.data.name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function logout(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Get current user error:", error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function getSession() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Get session error:", error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}
