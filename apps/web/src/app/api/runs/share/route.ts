import { NextRequest, NextResponse } from "next/server";
import { Client } from "langsmith";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function shareRunWithRetry(
  lsClient: Client,
  runId: string
): Promise<string> {
  // Add an initial delay before the first attempt
  const initialDelay = 2000; // 2 seconds
  console.log(`Waiting ${initialDelay / 1000} seconds before first share attempt for run ${runId}...`);
  await new Promise((resolve) => setTimeout(resolve, initialDelay));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Add a nested try/catch to potentially log more details from the specific error
      try {
        console.log(`Attempt ${attempt}: Trying to share run ${runId}...`); // Add log before attempt
        const sharedUrl = await lsClient.shareRun(runId);
        console.log(`Attempt ${attempt}: Successfully shared run ${runId}. URL: ${sharedUrl}`); // Add success log
        return sharedUrl;
      } catch (innerError: any) {
        console.error(`shareRun attempt ${attempt} failed internally.`);
        // Log specific details from innerError
        if (innerError.message) {
          console.error(`Inner error message: ${innerError.message}`);
        }
        if (innerError.stack) {
          console.error(`Inner error stack: ${innerError.stack}`);
        }
        // Log response details if available on the error object (structure might vary)
        if (innerError.response) {
          console.error(`Response status: ${innerError.response.status}`);
          try {
            const responseBody = await innerError.response.text(); // or .json() if applicable
            console.error(`Response body: ${responseBody}`);
          } catch (bodyError) {
            console.error("Failed to read response body:", bodyError);
          }
        }
        throw innerError; // Re-throw the error to be caught by the outer catch
      }
    } catch (error: any) { // Explicitly type error as any to access properties
      console.error(`shareRun attempt ${attempt} failed. Error object:`, JSON.stringify(error, null, 2)); // Log the full error object structure
      // Log specific properties if they exist
      if (error.message) {
        console.error(`Error message: ${error.message}`);
      }
      if (error.stack) {
        console.error(`Error stack: ${error.stack}`);
      }
      if (error.response) {
         console.error(`Response status: ${error.response.status}`);
         try {
           const responseBody = await error.response.text();
           console.error(`Response body: ${responseBody}`);
         } catch (bodyError) {
           console.error("Failed to read response body:", bodyError);
         }
      }

      if (attempt === MAX_RETRIES) {
        // The final error thrown here will be logged by the main POST handler's catch block
        throw error;
      }
      console.warn(
        `Attempt ${attempt} failed. Retrying in ${RETRY_DELAY / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error("Max retries reached"); // This line should never be reached due to the throw in the loop
}

export async function POST(req: NextRequest) {
  const { runId } = await req.json();

  if (!runId) {
    return new NextResponse(
      JSON.stringify({
        error: "`runId` is required to share run.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const lsClient = new Client({
    apiKey: process.env.LANGCHAIN_API_KEY,
  });

  try {
    const sharedRunURL = await shareRunWithRetry(lsClient, runId);

    return new NextResponse(JSON.stringify({ sharedRunURL }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) { // Explicitly type error as any
    console.error(
      `Failed to share run with id ${runId} after ${MAX_RETRIES} attempts:\n`,
      error // Log the error object directly
    );
    console.error(
      `Failed to share run with id ${runId} after ${MAX_RETRIES} attempts. Final error:`,
      JSON.stringify(error, null, 2) // Log the full final error object
    );
    // Log specific properties if they exist
    if (error.message) {
      console.error(`Final error message: ${error.message}`);
    }
    if (error.stack) {
      console.error(`Final error stack: ${error.stack}`);
    }
    return new NextResponse(
      JSON.stringify({ error: "Failed to share run after multiple attempts." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
