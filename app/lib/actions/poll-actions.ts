"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const createPollSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(500, "Question too long"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required")
    .max(10, "Too many options"),
});

const updatePollSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(500, "Question too long"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required")
    .max(10, "Too many options"),
});

// Result types for better type safety
type PollResult = {
  success: boolean;
  error?: string;
  poll?: any;
  polls?: any[];
};

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Authentication required" };
  }

  return { user, error: null };
}

// Helper function to check poll ownership
async function checkPollOwnership(pollId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", pollId)
    .single();

  if (error || !data) {
    return { isOwner: false, error: "Poll not found" };
  }

  return { isOwner: data.user_id === userId, error: null };
}

export async function createPoll(formData: FormData): Promise<PollResult> {
  try {
    const question = formData.get("question") as string;
    const options = formData.getAll("options").filter(Boolean) as string[];

    // Validate input
    const validationResult = createPollSchema.safeParse({ question, options });
    if (!validationResult.success) {
      return {
        success: false,
        error: "Please provide a question and at least two options.",
      };
    }

    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return {
        success: false,
        error: authError,
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("polls")
      .insert([
        {
          user_id: user.id,
          question: validationResult.data.question,
          options: validationResult.data.options,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/polls");
    return {
      success: true,
      poll: data,
    };
  } catch (error) {
    console.error("Create poll error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function getUserPolls(): Promise<PollResult> {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return {
        success: false,
        error: authError,
        polls: [],
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
        polls: [],
      };
    }

    return {
      success: true,
      polls: data || [],
    };
  } catch (error) {
    console.error("Get user polls error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      polls: [],
    };
  }
}

export async function getPollById(id: string): Promise<PollResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      poll: data,
    };
  } catch (error) {
    console.error("Get poll by ID error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function submitVote(
  pollId: string,
  optionIndex: number
): Promise<PollResult> {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return {
        success: false,
        error: authError,
      };
    }

    // Validate option index
    const pollResult = await getPollById(pollId);
    if (!pollResult.success || !pollResult.poll) {
      return {
        success: false,
        error: "Poll not found",
      };
    }

    const poll = pollResult.poll;
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return {
        success: false,
        error: "Invalid option index",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("votes").insert([
      {
        poll_id: pollId,
        user_id: user.id,
        option_index: optionIndex,
      },
    ]);

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
    console.error("Submit vote error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function deletePoll(id: string): Promise<PollResult> {
  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return {
        success: false,
        error: authError,
      };
    }

    // Check ownership
    const { isOwner, error: ownershipError } = await checkPollOwnership(
      id,
      user.id
    );
    if (ownershipError || !isOwner) {
      return {
        success: false,
        error: "You can only delete your own polls",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("polls").delete().eq("id", id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/polls");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete poll error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

export async function updatePoll(
  pollId: string,
  formData: FormData
): Promise<PollResult> {
  try {
    const question = formData.get("question") as string;
    const options = formData.getAll("options").filter(Boolean) as string[];

    // Validate input
    const validationResult = updatePollSchema.safeParse({ question, options });
    if (!validationResult.success) {
      return {
        success: false,
        error: "Please provide a question and at least two options.",
      };
    }

    // Get authenticated user
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) {
      return {
        success: false,
        error: authError,
      };
    }

    // Check ownership
    const { isOwner, error: ownershipError } = await checkPollOwnership(
      pollId,
      user.id
    );
    if (ownershipError || !isOwner) {
      return {
        success: false,
        error: "You can only edit your own polls",
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("polls")
      .update({
        question: validationResult.data.question,
        options: validationResult.data.options,
      })
      .eq("id", pollId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/polls");
    return {
      success: true,
      poll: data,
    };
  } catch (error) {
    console.error("Update poll error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
