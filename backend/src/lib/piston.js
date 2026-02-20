// Using Judge0 CE API (free, no auth required)
// Piston public API now requires authorization as of Feb 15, 2026
const JUDGE0_PUBLIC = "https://ce.judge0.com";

// Language IDs for Judge0
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  c: 50, // C (GCC)
  cpp: 54, // C++ (GCC)
};

export async function executeCode(language, code) {
  const languageId = LANGUAGE_IDS[language];

  if (!languageId) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    // Create submission with wait=true for synchronous response
    const createResponse = await fetch(
      `${JUDGE0_PUBLIC}/submissions?base64_encoded=true&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: Buffer.from(code).toString("base64"),
          stdin: "",
        }),
      },
    );

    if (!createResponse.ok) {
      // Fallback: try without wait and poll
      return await executeCodeWithPolling(languageId, code);
    }

    const result = await createResponse.json();

    // Decode base64 output
    const stdout = result.stdout
      ? Buffer.from(result.stdout, "base64").toString("utf-8")
      : "";
    const stderr = result.stderr
      ? Buffer.from(result.stderr, "base64").toString("utf-8")
      : "";
    const compileOutput = result.compile_output
      ? Buffer.from(result.compile_output, "base64").toString("utf-8")
      : "";

    // Check for errors
    if (result.status?.id >= 6) {
      // Compilation error, runtime error, etc.
      return {
        success: false,
        output: stdout,
        error:
          stderr ||
          compileOutput ||
          result.status?.description ||
          "Execution failed",
      };
    }

    return {
      success: true,
      output: stdout || "No output",
    };
  } catch (error) {
    console.error("Judge0 API error:", error.message);
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}

async function executeCodeWithPolling(languageId, code) {
  try {
    // Create submission without waiting
    const createResponse = await fetch(
      `${JUDGE0_PUBLIC}/submissions?base64_encoded=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: Buffer.from(code).toString("base64"),
          stdin: "",
        }),
      },
    );

    if (!createResponse.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${createResponse.status}`,
      };
    }

    const { token } = await createResponse.json();

    // Poll for result
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const getResponse = await fetch(
        `${JUDGE0_PUBLIC}/submissions/${token}?base64_encoded=true`,
      );
      result = await getResponse.json();

      // Status 1 = In Queue, Status 2 = Processing
      if (result.status?.id > 2) break;
    }

    if (!result || result.status?.id <= 2) {
      return {
        success: false,
        error: "Execution timed out",
      };
    }

    const stdout = result.stdout
      ? Buffer.from(result.stdout, "base64").toString("utf-8")
      : "";
    const stderr = result.stderr
      ? Buffer.from(result.stderr, "base64").toString("utf-8")
      : "";
    const compileOutput = result.compile_output
      ? Buffer.from(result.compile_output, "base64").toString("utf-8")
      : "";

    if (result.status?.id >= 6) {
      return {
        success: false,
        output: stdout,
        error:
          stderr ||
          compileOutput ||
          result.status?.description ||
          "Execution failed",
      };
    }

    return {
      success: true,
      output: stdout || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}
