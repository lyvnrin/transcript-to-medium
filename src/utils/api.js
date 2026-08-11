const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Placeholder for the real Claude-powered conversion. Returns a canned
// article after a simulated delay so the upload → processing → preview
// flow can be built and tested end to end before the API is wired up.
export async function convertTranscript(_transcript) {
  await wait(1400)

  return {
    title: 'What We Learned Building an AI Pair Programmer',
    subtitle:
      'Notes from an Applied AI session on tool use, context windows, and knowing when to get out of the way.',
    content: [
      {
        type: 'paragraph',
        text: 'Every session starts the same way: a blank editor, a vague goal, and a model that is eager to help before it understands the problem. The teams that got the most out of their AI pair programmer were the ones that resisted the urge to just start typing.',
      },
      { type: 'heading', text: 'Start with the constraints' },
      {
        type: 'paragraph',
        text: 'The best sessions began with a short, explicit brief — what the code should do, what it should not touch, and what "done" looks like. Skipping this step did not make things faster; it just moved the clarifying questions later in the conversation, where they were more expensive to answer.',
      },
      {
        type: 'paragraph',
        text: 'Constraints also gave the model permission to push back. When the brief was vague, it guessed. When it was specific, it asked good questions instead.',
      },
      { type: 'heading', text: 'Context windows are a budget, not a buffer' },
      {
        type: 'paragraph',
        text: 'Treating the context window like unlimited scratch space led to slower, less focused answers. The sessions that stayed sharp were the ones where irrelevant files, old attempts, and dead ends were actively pruned rather than left to accumulate.',
      },
      {
        type: 'paragraph',
        text: 'This is the placeholder article generated for your transcript. Once the real conversion is wired up, this text will be replaced with content generated from what you uploaded.',
      },
    ],
  }
}
