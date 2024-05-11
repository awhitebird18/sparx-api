import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { Channel } from 'src/channels/entities/channel.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Note } from 'src/notes/entities/note.entity';
import { FlashcardIdea } from './dto/flashcard-idea.dto';
import { RoadmapTopic } from './dto/roadmap-top.dto';
import { NoteIdea } from './dto/note-idea.dto';
import { SubtopicIdea } from './dto/suptopic-idea.dto';
import { v4 as uuid } from 'uuid';
import { convertStringToFlashcardContentFormat } from 'src/card/utils/convertStringToFlashcardContentFormat';

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

@Injectable()
export class AssistantService {
  async generateRoadmapTopics(topic: string): Promise<RoadmapTopic[]> {
    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `Please generate a roadmap of major topics for learning ${topic}. For example, if I am learning Frontend Development a roadmap map look like [{topic: "Internet", subtopics: ["How does the internet work?", "What is HTTP?". "What is domain name?", "What is hosting?", "DNS and how it works?", "Browsers and how they work?"]}, {topic: "HTML", subtopics: ["Learn the basics", "Writing semantic HTML", "Forms and Validations", "Accessibility", "SEO Basics"]}, {topic: "CSS", subtopics: ["Learn the basics", "Making Layouts", "Responsive Design"]}...]. Please generate this format and keep the titles short. Please provide an array of objects and in json format.`,
          role: 'user',
        },
      ],
    });

    const data = chatCompletion.choices[0].message.content;

    let jsonObject: RoadmapTopic[] | undefined = undefined;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    return jsonObject;
  }

  async generateSubtopics(
    channelName: string,
    workspaceName: string,
  ): Promise<SubtopicIdea[]> {
    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `Please generate me subtopics for ${channelName} in relation to ${workspaceName}. For example, if I would like to know more about "Browsers and how they work" additional subtopics may look like ["Browser Architecture", "Browser Security Features",  "Browser Storage Options", "Browser Developer Tools",  "Browser Compatibility", etc..] and provide a very brief explanation on why it relates to the topic. Please generate an array of objects with the keys as title and explanation.`,
          role: 'user',
        },
      ],
    });

    const data = chatCompletion.choices[0].message.content;

    let jsonObject: SubtopicIdea[] | undefined = undefined;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    return jsonObject;
  }

  async generateFlashcardIdeas(
    note: Note,
    channel: Channel,
    workspace: Workspace,
  ): Promise<FlashcardIdea[]> {
    if (!isJsonString(note.content)) return;

    const parsedJson = JSON.parse(note.content);

    const contentArr = parsedJson.root.children[0].children;

    let text = '';

    for (let i = 0; i < contentArr.length; i++) {
      text += contentArr[i].text;
    }

    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `Please generate me flashcards for this article ${text}. For context, this is in relation to ${channel.name} and ${workspace.name}. Please provide the output in this format: [{front: 'Put front field content here', back: 'Put back field content here'}]. The frontside should be a question and the back should be the answer. Please make the output in valid json format.`,
          role: 'user',
        },
      ],
    });

    const data = chatCompletion.choices[0].message.content;

    let jsonObject: FlashcardIdea[] | undefined = undefined;

    if (isJsonString(JSON.stringify(data))) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    const convertedFlashcardIdeas = jsonObject.map((flashcardIdea) => {
      const front = convertStringToFlashcardContentFormat(flashcardIdea.front);
      const back = convertStringToFlashcardContentFormat(flashcardIdea.back);

      return {
        ...flashcardIdea,
        front,
        back,
        uuid: uuid(),
      };
    });

    return convertedFlashcardIdeas;
  }

  async generateNote(workspace: Workspace, title: string): Promise<NoteIdea> {
    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `I am trying to learn more about ${title} in relation to ${workspace.name}. Can you please generate me an article? Please provide the output in valid json format with a title property and a content property with the summarized article.`,
          role: 'user',
        },
      ],
    });
    const data: string = chatCompletion.choices[0].message.content;

    let jsonObject: NoteIdea | undefined = undefined;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    return jsonObject;
  }

  async summarizeArticle(channel: Channel, article: string): Promise<NoteIdea> {
    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `Can you please summarize this article: ${article} in relation to ${channel.name}. Please provide the output in valid json format with a title property and a content property with the summarized article.`,
          role: 'user',
        },
      ],
    });
    const data: string = chatCompletion.choices[0].message.content;

    let jsonObject: NoteIdea | undefined = undefined;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    return jsonObject;
  }
}
