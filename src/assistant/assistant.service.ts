import { Injectable } from '@nestjs/common';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';
import { OpenAI } from 'openai';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { ChannelConnectorsRepository } from 'src/channel-connectors/channel-connectors.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { NotesRepository } from 'src/notes/notes.repository';
import { User } from 'src/users/entities/user.entity';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';
import { CardNoteService } from 'src/card-note/card-note.service';
import { Template } from 'src/card-template/entities/card-template.entity';

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
  constructor(
    private channelRepository: ChannelsRepository,
    private workspaceRepository: WorkspacesRepository,
    private channelConnectorsRepository: ChannelConnectorsRepository,
    private notesRepository: NotesRepository,
    private cardTemplateRepository: CardTemplateRepository,
    private cardNoteService: CardNoteService,
  ) {}

  create(createAssistantDto: CreateAssistantDto) {
    return 'This action adds a new assistant';
  }

  async generateSubtopics(channelId: string, workspaceId: string) {
    const channel = await this.channelRepository.findByUuid(channelId);
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    const channelConnectors = await this.channelConnectorsRepository.find({
      where: { parentChannel: { id: channel.id } },
      relations: ['childChannel'],
    });

    console.log(channelConnectors);

    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `Please generate me subtopics for ${channel.name} in relation to ${workspace.name}. For example, if I would like to know more about "Browsers and how they work" additional subtopics may look like ["Browser Architecture", "Browser Security Features",  "Browser Storage Options", "Browser Developer Tools",  "Browser Compatibility", etc..] and provide a very brief explanation on why it relates to the topic. Please generate an array of objects with the keys as title and explanation.`,
          role: 'user',
        },
      ],
    });

    return chatCompletion.choices[0].message.content;
  }

  async generateFlashcards(
    noteId: string,
    channelId: string,
    workspaceId: string,
    user: User,
  ) {
    const note = await this.notesRepository.findByUuid(noteId);

    const channel = await this.channelRepository.findByUuid(channelId);
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    const cardTemplates = await this.cardTemplateRepository.findAllByUser(user);

    const selectedTemplate: Template = cardTemplates[0];

    if (!isJsonString(note.content)) return;

    const parsedJson = JSON.parse(note.content);

    const contentArr = parsedJson.root.children[0].children;

    let text = '';

    for (let i = 0; i < contentArr.length; i++) {
      text += contentArr[i].text;
    }

    const frontFieldUuid = selectedTemplate.fields[0].uuid;
    const backFieldUuid = selectedTemplate.fields[1].uuid;

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
    console.log(data);

    let jsonObject;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    const flashcards = jsonObject.map((flashcard) => {
      const frontSide = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: flashcard.front,
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      };
      const backSide = {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: flashcard.back,
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      };

      return {
        channelId,
        templateId: selectedTemplate.uuid,
        workspaceId,
        fieldValues: [
          { uuid: frontFieldUuid, value: frontSide },
          { uuid: backFieldUuid, value: backSide },
        ],
      };
    });

    const returnData = await Promise.all(
      flashcards.map((flashcard) =>
        this.cardNoteService.create(flashcard, user),
      ),
    );

    return returnData;
  }

  async generateNote(
    channelId: string,
    workspaceId: string,
    title: string,
    user: User,
  ) {
    const channel = await this.channelRepository.findByUuid(channelId);
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

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
    const data = chatCompletion.choices[0].message.content;

    let jsonObject;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    const jsonString = {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: jsonObject.content,
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    console.log('1:', jsonString);
    console.log('2:', JSON.stringify(jsonString));

    const note = await this.notesRepository.createNote(
      { content: JSON.stringify(jsonString), title: jsonObject.title },
      channel,
      user,
    );

    return {
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      content: note.content,
      lastAccessed: note.updatedAt,
      // Assuming createdBy is a User entity with firstName and lastName
      createdBy: note.createdBy.uuid,
    };
  }

  async summarizeArticle(
    channelId: string,
    workspaceId: string,
    article: string,
    user: User,
  ) {
    const channel = await this.channelRepository.findByUuid(channelId);
    const workspace = await this.workspaceRepository.findWorkspaceByUuid(
      workspaceId,
    );

    const channelConnectors = await this.channelConnectorsRepository.find({
      where: { parentChannel: { id: channel.id } },
      relations: ['childChannel'],
    });

    console.log(channelConnectors);

    const openAIClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const chatCompletion = await openAIClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          content: `Can you please summarize this article: ${article}. Please provide the output in valid json format with a title property and a content property with the summarized article.`,
          role: 'user',
        },
      ],
    });
    const data = chatCompletion.choices[0].message.content;

    let jsonObject;

    if (isJsonString(data)) {
      jsonObject = JSON.parse(data);
      console.log('Parsed JSON Object:', jsonObject);
    } else {
      console.error('Received data is not a valid JSON string.');
    }

    const jsonString = `{
      "root": {
        "children": [
          {
            "children": [
              {
                "detail": 0,
                "format": 0,
                "mode": "normal",
                "style": "",
                "text": "${jsonObject.content}",
                "type": "text",
                "version": 1
              }
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "type": "paragraph",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
      }
    }`;

    console.log({ content: jsonString, title: jsonObject.title }, jsonString);

    const note = await this.notesRepository.createNote(
      { content: jsonString, title: jsonObject.title },
      channel,
      user,
    );

    return {
      title: note.title,
      isPrivate: note.isPrivate,
      uuid: note.uuid,
      createdAt: note.createdAt,
      content: note.content,
      lastAccessed: note.updatedAt,
      // Assuming createdBy is a User entity with firstName and lastName
      createdBy: note.createdBy.uuid,
    };
  }

  findAll() {
    return `This action returns all assistant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assistant`;
  }

  update(id: number, updateAssistantDto: UpdateAssistantDto) {
    return `This action updates a #${id} assistant`;
  }

  remove(id: number) {
    return `This action removes a #${id} assistant`;
  }
}
