import { NextRequest, NextResponse } from 'next/server';
import PersonalWebsiteAssistant from './assistant';

export async function POST(req: NextRequest) {
  let { message, threadId } = await req.json();

  try {
    const assistant = await PersonalWebsiteAssistant.getAssistant();
    console.log("threadId:", threadId);
    if (!threadId) {
      // Create a new thread
      const thread = await assistant.createThread();
      threadId = thread.id;
    }

    // Add a message to the thread
    await assistant.addMessageToThread(threadId, message);

    // Create a run and poll for the response
    let responseMessage = await assistant.runThread(threadId);

    return NextResponse.json({ response: responseMessage.message, threadId: threadId, action: responseMessage.action });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error', response: "Looks like I'm having trouble right now. Please try again later.", threadId: threadId, action: null }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
} 