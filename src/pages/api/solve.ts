import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt, image } = await request.json();

    if (!prompt && !image) {
      return new Response(JSON.stringify({ error: 'Prompt or image is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize the Google Generative AI SDK using environment variable
    const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Gemini API Key is missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: "You are the SolversPro backend. Solve the user's problem step-by-step. You must format all mathematical formulas and equations using standard LaTeX syntax wrapped in double dollar signs ($$) for block math or single dollar signs ($) for inline math. Do not use standard markdown formatting for math.",
    });

    const contentParts = [];
    if (prompt) {
      contentParts.push({ text: prompt });
    } else {
      contentParts.push({ text: "Please analyze and solve the problem presented in this image." });
    }

    if (image && image.data && image.mimeType) {
      contentParts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    const result = await model.generateContentStream(contentParts);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (streamError) {
          console.error("Stream reading error:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Solve Endpoint Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
