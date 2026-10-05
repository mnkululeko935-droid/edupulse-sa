import { ai, router, json, error } from '@appdeploy/sdk';

export const handler = router({
  'GET /api/_healthcheck': [
    async () => json({ message: 'Success' }),
  ],

  'POST /api/tutor': [
    async ({ body }) => {
      const input = body as {
        grade?: string;
        curriculum?: string;
        subject?: string;
        topic?: string;
        question?: string;
      };

      if (!input.question?.trim()) {
        return error('Please enter a study question.', 400);
      }

      try {
        const result = await ai.generate({
          system:
            'You are EduPulse AI Tutor, an educational tutor for South African school learners. Teach clearly and safely. Adapt explanations to the learner grade and subject. Respect the selected CAPS or IEB pathway. Do not claim to reproduce official curriculum documents verbatim. Explain concepts in your own words, use worked examples when appropriate, and encourage learners to check their teacher guidance and official curriculum sources.',

          prompt: [
            'Grade: ' + (input.grade || 'Not specified'),
            'Curriculum: ' + (input.curriculum || 'South African syllabus'),
            'Subject: ' + (input.subject || 'Any subject'),
            'Topic: ' + (input.topic || 'Not specified'),
            'Learner question: ' + input.question,
            'Return a concise but useful lesson with: direct explanation, steps/examples where useful, and a short practice question.',
          ].join('\n'),

          maxTokens: 1200,
          thinkingMode: 'FAST',
        });

        return json({ answer: result.text });
      } catch (err) {
        console.error('AI tutor error', err);
        return error(
          'The AI Tutor is temporarily unavailable. Please try again.',
          503
        );
      }
    },
  ],

  'POST /api/study': [
    async ({ body }) => {
      const input = body as {
        grade?: string;
        curriculum?: string;
        subject?: string;
        topic?: string;
        term?: string;
      };

      try {
        const result = await ai.generate({
          system:
            'You are EduPulse Study Mode, a patient South African school teacher. Create original notes and one exercise for the selected learner context. Respect CAPS/IEB but never copy official curriculum documents verbatim. Return exactly two labelled sections: LESSON NOTES and EXERCISE.',

          prompt: [
            'Grade: ' + (input.grade || ''),
            'Curriculum: ' + (input.curriculum || ''),
            'Term: ' + (input.term || ''),
            'Subject: ' + (input.subject || ''),
            'Topic: ' + (input.topic || ''),
          ].join('\n'),

          maxTokens: 1800,
          thinkingMode: 'FAST',
        });

        const parts = result.text.split(/EXERCISE:?/i);

        return json({
          lesson: parts[0]
            .replace(/LESSON NOTES:?/i, '')
            .trim(),

          exercise:
            parts[1] ||
            'Explain the topic in your own words and give one example.',
        });
      } catch (err) {
        console.error('Study mode error', err);
        return error(
          'Study Mode is temporarily unavailable. Please try again.',
          503
        );
      }
    },
  ],

  'POST /api/study/check': [
    async ({ body }) => {
      const input = body as {
        grade?: string;
        curriculum?: string;
        subject?: string;
        topic?: string;
        exercise?: string;
        answer?: string;
      };

      if (!input.answer?.trim()) {
        return error('Please enter an answer.', 400);
      }

      try {
        const result = await ai.generate({
          system:
            'You are a patient tutor checking a learner answer. Return exactly MASTERY: YES or MASTERY: NO, then FEEDBACK: and concise helpful feedback. If NO, identify the misconception and give a small hint. If YES, explain why the answer demonstrates understanding.',

          prompt: [
            'Grade: ' + (input.grade || ''),
            'Curriculum: ' + (input.curriculum || ''),
            'Subject: ' + (input.subject || ''),
            'Topic: ' + (input.topic || ''),
            'Exercise: ' + (input.exercise || ''),
            'Learner answer: ' + input.answer,
          ].join('\n'),

          maxTokens: 900,
          thinkingMode: 'FAST',
        });

        const mastered = /MASTERY:\s*YES/i.test(result.text);

        const feedback = result.text
          .replace(/MASTERY:\s*(YES|NO)/i, '')
          .replace(/FEEDBACK:\s*/i, '')
          .trim();

        return json({
          mastered,
          feedback,
        });
      } catch (err) {
        console.error('Study check error', err);
        return error(
          'The answer checker is temporarily unavailable. Please try again.',
          503
        );
      }
    },
  ],
});
