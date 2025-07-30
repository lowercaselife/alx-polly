import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schemas
const updatePollSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .optional(),
  description: z.string().optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required")
    .max(10, "Too many options")
    .optional(),
  settings: z
    .object({
      allowMultipleVotes: z.boolean(),
      requireAuthentication: z.boolean(),
    })
    .optional(),
  endDate: z.string().datetime().optional(),
});

// Helper function to authenticate user
async function authenticateUser() {
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("polls")
      .select(
        `
        *,
        votes(count),
        user:user_id(id, email, user_metadata)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({ poll: data }, { status: 200 });
  } catch (error) {
    console.error("Get poll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate input
    const validationResult = updatePollSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Authenticate user
    const { user, error: authError } = await authenticateUser();
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Check ownership
    const { isOwner, error: ownershipError } = await checkPollOwnership(
      id,
      user.id
    );
    if (ownershipError || !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own polls" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Update poll
    const { data, error } = await supabase
      .from("polls")
      .update(validationResult.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Poll updated successfully",
        poll: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update poll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Authenticate user
    const { user, error: authError } = await authenticateUser();
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    // Check ownership
    const { isOwner, error: ownershipError } = await checkPollOwnership(
      id,
      user.id
    );
    if (ownershipError || !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own polls" },
        { status: 403 }
      );
    }

    const supabase = await createClient();

    // Delete poll (this will cascade delete votes due to foreign key constraints)
    const { error } = await supabase.from("polls").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Poll deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete poll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
