import { Router, Response } from 'express';

const router = Router();

// Mock narrative SSE endpoint
router.get('/narrative', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sessionId = req.query.session_id;

  // Mock DM response
  const mockResponses = [
    "The innkeeper slides a cup of something dark across the bar. \"You look like someone who's seen the Breach,\" she says, not looking up.",
    "A hooded figure in the corner watches you carefully.",
    "You notice the tavern is quieter than usual. Most patrons keep their eyes down.",
  ];

  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  let charIndex = 0;

  const sendChunk = () => {
    if (charIndex < response.length) {
      res.write(`event: narrative.chunk\ndata: ${JSON.stringify({ text: response[charIndex] })}\n\n`);
      charIndex++;
      setTimeout(sendChunk, 30); // 30ms per character for typewriter effect
    } else {
      // Send end event
      res.write(`event: narrative.end\ndata: ${JSON.stringify({ dmName: 'Oracle' })}\n\n`);
      res.end();
    }
  };

  sendChunk();
});

export default router;
