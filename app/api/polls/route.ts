import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schemas
const createPollSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least 2 options required")
    .max(10, "Too many options"),
  settings: z
    .object({
      allowMultipleVotes: z.boolean().default(false),
      requireAuthentication: z.boolean().default(true),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    let query = supabase
      .from("polls")
      .select(
        `
        *,
        votes(count),
        user:user_id(id, email, user_metadata)
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if specified
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        polls: data,
        pagination: {
          limit,
          offset,
          hasMore: data.length === limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get polls error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createPollSchema.safeParse(body);
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

    const { title, description, options, settings, endDate } =
      validationResult.data;
    const supabase = await createClient();

    // Create poll
    const { data, error } = await supabase
      .from("polls")
      .insert([
        {
          user_id: user.id,
          title,
          description,
          options,
          settings: settings || {
            allowMultipleVotes: false,
            requireAuthentication: true,
          },
          end_date: endDate,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Poll created successfully",
        poll: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create poll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
