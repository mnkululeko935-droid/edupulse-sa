const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

async function askGemini(env, prompt) {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Gemini API request failed.');
  }

  const answer =
    data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('') || '';

  return answer;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);

    try {
      if (request.method !== 'POST') {
        return json({
          service: 'EduPulse SA AI Backend',
          status: 'online'
        });
      }

      const body = await request.json();

      if (url.pathname === '/api/tutor') {
        const {
          grade,
          curriculum,
          subject,
          topic,
          question
        } = body;

        const prompt = `
You are EduPulse SA Tutor, an educational AI for South African learners.

Learner grade: ${grade}
Curriculum: ${curriculum}
Subject: ${subject}
Topic: ${topic}

Student question:
${question}

Teach the learner clearly and accurately.

Use South African school context where appropriate.
Explain difficult ideas step by step.
Do not simply give an answer when teaching would be better.
For calculations, show the working.
Keep the explanation appropriate for the learner's grade.
        `;

        const answer = await askGemini(env, prompt);

        return json({ answer });
      }

      if (url.pathname === '/api/study') {
        const {
          grade,
          curriculum,
          subject,
          topic,
          term
        } = body;

        const prompt = `
You are EduPulse SA Study Mode.

Create a complete interactive lesson for:

Grade: ${grade}
Curriculum: ${curriculum}
Subject: ${subject}
Topic: ${topic}
Term: ${term}

Structure the response as:

1. Learning objectives
2. Explanation of the topic
3. Important concepts
4. Worked example where appropriate
5. Common mistakes
6. Short practice exercise
7. A final challenge question

Teach at the learner's grade level.
Use clear South African school terminology.
        `;

        const lesson = await askGemini(env, prompt);

        return json({ lesson });
      }

      if (url.pathname === '/api/study/check') {
        const {
          grade,
          curriculum,
          subject,
          topic,
          exercise,
          answer
        } = body;

        const prompt = `
You are EduPulse SA Study Mode's answer checker.

Grade: ${grade}
Curriculum: ${curriculum}
Subject: ${subject}
Topic: ${topic}

Exercise:
${exercise}

Learner's answer:
${answer}

Check the learner's answer.

Give:
1. Whether the answer is correct, partly correct, or incorrect.
2. A short explanation.
3. The correct method or answer when necessary.
4. One useful tip for improving.

Do not be harsh. Teach the learner.
        `;

        const feedback = await askGemini(env, prompt);

        return json({ feedback });
      }

      return json({
        error: 'EduPulse API route not found.'
      }, 404);

    } catch (error) {
      return json({
        error: error?.message || 'EduPulse AI service error.'
      }, 500);
    }
  }
};
