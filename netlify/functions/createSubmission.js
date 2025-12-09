exports.handler = async function(event, context) {
  // Handle CORS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "https://sunscreenlab.github.io",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: ""
    };
  }

  try {
    const body = JSON.parse(event.body);

    const issueTitle = `Sunscreen Submission: ${body.brand} – ${body.name}`;
    const issueBody = `
A new sunscreen was submitted:

\`\`\`json
${JSON.stringify(body, null, 2)}
\`\`\`

Submitted from: Add a Sunscreen form
    `;

    const response = await fetch(
      "https://api.github.com/repos/sunscreenlab/sunscreenlab/issues",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
          "User-Agent": "NetlifyFunction"
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody
        })
      }
    );

    const text = await response.text();
    console.log("GitHub response:", text);

    const success = response.ok;

    return {
      statusCode: success ? 200 : 500,
      headers: {
        "Access-Control-Allow-Origin": "https://sunscreenlab.github.io",
      },
      body: success
        ? JSON.stringify({ message: "Submission received! Thank you." })
        : JSON.stringify({ message: "Failed to create issue", details: text })
    };

  } catch (err) {
    console.log("Function error:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "https://sunscreenlab.github.io",
      },
      body: JSON.stringify({ message: "Error processing submission", error: err.message })
    };
  }
};
