import { NextRequest, NextResponse } from "next/server";
import { db, UserUsageTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { handleAuthorizationV2, AuthorizationError } from "@/lib/handleAuthorization";

export async function GET(request: NextRequest) {
  try {
    // This will throw an error if not authorized
    const { userId } = await handleAuthorizationV2(request);

    // Get usage information
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);

    if (!userUsage.length) {
      return NextResponse.json({
        tokenUsage: 0,
        maxTokenUsage: 100000, // Default legacy plan tokens
        audioTranscriptionMinutes: 0,
        maxAudioTranscriptionMinutes: 0, // Default to 0 for legacy/free tier
        subscriptionStatus: "active",
        currentPlan: "Legacy Plan",
        isActive: true
      });
    }

    return NextResponse.json({
      tokenUsage: userUsage[0].tokenUsage || 0,
      maxTokenUsage: userUsage[0].maxTokenUsage || 100000,
      audioTranscriptionMinutes: userUsage[0].audioTranscriptionMinutes || 0,
      maxAudioTranscriptionMinutes: userUsage[0].maxAudioTranscriptionMinutes || 0,
      subscriptionStatus: userUsage[0].subscriptionStatus || "inactive",
      currentPlan: userUsage[0].currentPlan || "Legacy Plan",
      isActive: userUsage[0].subscriptionStatus === "active"
    });

  } catch (error: any) {
    // Handle AuthorizationError with proper status code
    if (error instanceof AuthorizationError || (error?.name === 'AuthorizationError')) {
      return NextResponse.json(
        { error: error.message || 'Authorization failed' },
        { status: error.status || 403 }
      );
    }

    // Handle token limit errors specially
    if (error instanceof Error && error.message.includes("Token limit exceeded")) {
      return NextResponse.json({
        error: "Token limit exceeded. Please upgrade your plan for more tokens."
      }, { status: 429 });
    }

    console.error("Error fetching usage data:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to fetch usage data"
    }, { status: error?.status || 500 });
  }
}
