import OpenAI from 'openai';
import { sendEmail } from './emailTools';
import { scheduleMeeting, getFreeBusy } from './googleTools';
import { getWorkExperience } from './infoTools';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class PersonalWebsiteAssistant {
  private static instance: PersonalWebsiteAssistant | null = null;
  public static assistant: any;

  private constructor() {
    // Initialization logic moved to a separate method
  }

  private async initializeAssistant() {
    console.log("Initializing assistant");
    const todays_date = new Date().toISOString();
    await openai.beta.assistants.update(
      "asst_fybac2gkaMejjj1ILGAXCnnV",
      {
        instructions:
          `You are a personal assistant for Craig Chisholm.
          You will help users that come to Craig's personal website perform
          tasks and answer questions for them. Questions should mostly be about
          Craig or his experience. Today's date is ${todays_date}. Craig's contact information is Email: chisholm.craig@gmail.com,
          Phone: 604-935-4855, LinkedIN: https://www.linkedin.com/in/craigchisholm/.`,
      }
    );

    PersonalWebsiteAssistant.assistant = await openai.beta.assistants.retrieve(
      "asst_fybac2gkaMejjj1ILGAXCnnV"
    );
  }

  public async createThread() {
    const thread = await openai.beta.threads.create();
    return thread;
  }

  public async addMessageToThread(threadId: string, message: string) {
    const todays_date = new Date().toISOString();

    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
      metadata: {
        todays_date: todays_date
      },
    });
  }

  public async runThread(threadId: string) {
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: PersonalWebsiteAssistant.assistant.id,
    });

    return await this.handleRunStatus(run, null);
  }


  private async handleRunStatus(run: any, frontEndAction: string | null): Promise<any> {
    // Check if the run is completed
    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const responseMessage = messages.data.find(msg => msg.role === 'assistant');
      
      if (responseMessage && 'text' in responseMessage.content[0]) {
        return {
          message: responseMessage.content[0].text.value || 'No response from assistant',
          action: frontEndAction
        };
      }
      return {
        message: messages.data,
        action: frontEndAction
      };
    } else if (run.status === "requires_action") {
      return await this.handleRequiresAction(run, frontEndAction);
    } else {
      console.error("Run did not complete:", run);
      return {
        message: 'No response from assistant',
        action: frontEndAction
      };
    }
  };

  private async handleRequiresAction(run: any, frontEndAction: string | null): Promise<any> {
    console.log("Requires action");
    // Check if there are tools that require outputs
    if (
      run.required_action &&
      run.required_action.submit_tool_outputs &&
      run.required_action.submit_tool_outputs.tool_calls
    ) {
      // Loop through each tool in the required action section
      const toolOutputs = await Promise.all(run.required_action.submit_tool_outputs.tool_calls.map(
        async (tool: any) => {
          let output;
          if (tool.function.name === "sendEmail") {
            output = await sendEmail(tool.function.arguments);
          } else if (tool.function.name === "scheduleMeeting") {
            output = await scheduleMeeting(tool.function.arguments);
          } else if (tool.function.name === "getFreeBusy") {
            output = await getFreeBusy(tool.function.arguments);
          } else if (tool.function.name === "getWorkExperience") {
            output = getWorkExperience();
          } else if (tool.function.name === "showCraigResume") {
            output = "Yes we can show the resume. Tell them you've opened the Resume in the top left corner.";
            frontEndAction = "showResume";
          }
          return {
            tool_call_id: tool.id,
            output: output,
          };
        },
      ));
  
      // Submit all tool outputs at once after collecting them in a list
      if (toolOutputs.length > 0) {
        run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
          run.thread_id,
          run.id,
          { tool_outputs: toolOutputs },
        );
        console.log("Tool outputs submitted successfully.");
      } else {
        console.log("No tool outputs to submit.");
      }
  
      // Check status after submitting tool outputs
      return await this.handleRunStatus(run, frontEndAction);
    }
  };

  public static async getAssistant() {
    console.log("Getting assistant");
    if (!PersonalWebsiteAssistant.instance) {
      console.log("Creating new instance");
      PersonalWebsiteAssistant.instance = new PersonalWebsiteAssistant();
      await PersonalWebsiteAssistant.instance.initializeAssistant();
    }
    return PersonalWebsiteAssistant.instance;
  }
}

export default PersonalWebsiteAssistant; 