import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const voteSchema = z.object({
  option: z.string().min(1, "Option is required"),
});

// Helper function to authenticate user (optional based on poll settings)
async function authenticateUser(requireAuth: boolean = true) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (requireAuth && (error || !user)) {
    return { user: null, error: "Authentication required" };
  }

  return { user, error: null };
}

// Helper function to check if user has already voted
async function checkExistingVote(pollId: string, userId: string | null) {
  if (!userId) return { hasVoted: false, error: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("id")
    .eq("poll_id", pollId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return { hasVoted: false, error: error.message };
  }

  return { hasVoted: !!data, error: null };
}

// Helper function to validate poll option
async function validatePollOption(pollId: string, option: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("options, settings")
    .eq("id", pollId)
    .single();

  if (error || !data) {
    return { isValid: false, error: "Poll not found" };
  }

  const isValidOption = data.options.includes(option);
  if (!isValidOption) {
    return { isValid: false, error: "Invalid option" };
  }

  return { isValid: true, settings: data.settings, error: null };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pollId } = params;
    const body = await request.json();

    // Validate input
    const validationResult = voteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { option } = validationResult.data;

    // Validate poll option
    const {
      isValid,
      settings,
      error: validationError,
    } = await validatePollOption(pollId, option);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Authenticate user if required
    const requireAuth = settings?.requireAuthentication ?? true;
    const { user, error: authError } = await authenticateUser(requireAuth);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Check if user has already voted (if authenticated)
    if (user) {
      const { hasVoted, error: voteCheckError } = await checkExistingVote(
        pollId,
        user.id
      );
      if (voteCheckError) {
        return NextResponse.json({ error: voteCheckError }, { status: 400 });
      }

      if (hasVoted && !settings?.allowMultipleVotes) {
        return NextResponse.json(
          { error: "You have already voted on this poll" },
          { status: 409 }
        );
      }
    }

    const supabase = await createClient();

    // Submit vote
    const { data, error } = await supabase
      .from("votes")
      .insert([
        {
          poll_id: pollId,
          user_id: user?.id || null,
          option,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Vote submitted successfully",
        vote: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
