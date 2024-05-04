import { Injectable } from '@nestjs/common';
import { SectionsService } from 'src/sections/sections.service';
import { CardTemplateService } from 'src/card-template/card-template.service';
import { CardFieldService } from 'src/card-field/card-field.service';
import { CardVariantService } from 'src/card-variant/card-variant.service';
import { CardTemplateDto } from 'src/card-template/dto/card-template.dto';
import { CardFieldDto } from 'src/card-field/dto/card-field.dto';
import { CardVariantDto } from 'src/card-variant/dto/card-variant.dto';
import { UserWorkspacesService } from 'src/user-workspaces/user-workspaces.service';
import { UsersRepository } from 'src/users/users.repository';
import { UserWorkspaceDto } from 'src/user-workspaces/dto/user-workspace.dto';
import { NodemapSettingsService } from 'src/nodemap-settings/nodemap-settings.service';
import { NodemapSettingsDto } from 'src/nodemap-settings/dto/nodemap-settings.dto';
import { ChannelsRepository } from 'src/channels/channels.repository';
import { ChannelSubscriptionsService } from 'src/channel-subscriptions/channel-subscriptions.service';
import { User } from 'src/users/entities/user.entity';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Injectable()
export class SeedService {
  constructor(
    private cardTemplateService: CardTemplateService,
    private cardFieldService: CardFieldService,
    private cardTypeService: CardVariantService,
    private sectionsService: SectionsService,
    private userWorkspacesService: UserWorkspacesService,
    private usersRepository: UsersRepository,
    private nodemapSettingsService: NodemapSettingsService,
    private channelsRepository: ChannelsRepository,
    private channelSubscriptionsService: ChannelSubscriptionsService,
    private workspaceService: WorkspacesService,
  ) {}

  async seedWorkspaceData(user: User, workspaceId: string) {
    const seedPromises = [];

    await this.addBotUsersToWorkspace(workspaceId);

    const createSectionsPromise =
      this.sectionsService.seedUserDefaultSections(user);

    const nodemapSettingsPromise = this.seedNodemapSettings(
      user.id,
      workspaceId,
    );

    const subscriptionsPromise = this.seedChannelSubscriptions(workspaceId);

    seedPromises.push(subscriptionsPromise);
    seedPromises.push(createSectionsPromise);
    seedPromises.push(nodemapSettingsPromise);

    // Seed flashcards
    const template = await this.seedTemplate(user, workspaceId);
    const cardType = await this.seedCardType(template.uuid);
    const fields = await this.seedCardFields(template);
    await this.assignFieldsToCardType(cardType.uuid, fields);

    await Promise.all(seedPromises);

    return { message: 'Successfully seeded workspace' };
  }

  async seedChannelSubscriptions(workspaceId: string) {
    const workspaceChannelsPromise = this.channelsRepository.find({
      where: { workspace: { uuid: workspaceId } },
    });
    const workspaceUsersPromise =
      this.userWorkspacesService.findWorkspaceUsers(workspaceId);

    const [workspaceChannels, workspaceUsers] = await Promise.all([
      workspaceChannelsPromise,
      workspaceUsersPromise,
    ]);

    const sortedUsers = workspaceUsers.sort(
      (a, b) => Number(b.isAdmin) - Number(a.isAdmin),
    );

    const totalUsers = sortedUsers.length;
    const totalChannels = workspaceChannels.length;
    const decrementStep = Math.ceil(totalUsers / totalChannels);
    let currentUserCount = totalUsers;

    const subscriptionPromises = [];

    for (const workspaceChannel of workspaceChannels) {
      // Determine users to subscribe
      const usersToSubscribe = sortedUsers.slice(
        0,
        Math.max(currentUserCount, 0),
      );

      // console.log(usersToSubscribe);

      // Subscribe users to workspaceChannel
      for (const userWorkspace of usersToSubscribe) {
        const subscriptionPromise =
          this.channelSubscriptionsService.joinChannel(
            userWorkspace.user.uuid,
            workspaceChannel.uuid,
          );

        subscriptionPromises.push(subscriptionPromise);
      }
      currentUserCount -= decrementStep;
    }

    await Promise.all(subscriptionPromises);
  }

  // Helpers
  async seedNodemapSettings(
    userId: number,
    workspaceId: string,
  ): Promise<NodemapSettingsDto> {
    const nodemapSettings = {
      userCountVisible: true,
      flashcardsDueVisible: true,
    };
    return await this.nodemapSettingsService.create(
      userId,
      workspaceId,
      nodemapSettings,
    );
  }

  async addBotUsersToWorkspace(
    workspaceId: string,
  ): Promise<UserWorkspaceDto[]> {
    const users = await this.usersRepository.find({
      where: { isBot: true },
    });

    const workspaceUsersMembershipPromises = users.map((user) =>
      this.userWorkspacesService.joinWorkspace(user, workspaceId),
    );
    return await Promise.all(workspaceUsersMembershipPromises);
  }

  async seedCardType(templateId: string): Promise<CardVariantDto> {
    const createTypeDto = {
      title: 'Front > Back',
      templateId,
    };
    const cardType = await this.cardTypeService.create(createTypeDto);
    return cardType;
  }

  async seedTemplate(
    user: User,
    workspaceId: string,
  ): Promise<CardTemplateDto> {
    const createTemplateDto = {
      isDefault: true,
      title: 'Basic',
      user,
    };
    return await this.cardTemplateService.create(
      createTemplateDto,
      workspaceId,
      user,
    );
  }

  async seedCardFields(template: CardTemplateDto): Promise<CardFieldDto[]> {
    const frontFieldDto = {
      title: 'Front',
      templateId: template.uuid,
    };
    const backFieldDto = {
      title: 'Back',
      templateId: template.uuid,
    };

    const frontFieldPromise = this.cardFieldService.create(frontFieldDto);
    const backFieldPromise = this.cardFieldService.create(backFieldDto);

    return await Promise.all([frontFieldPromise, backFieldPromise]);
  }

  async assignFieldsToCardType(
    cardTypeId: string,
    fields: CardFieldDto[],
  ): Promise<void> {
    await this.cardTypeService.addField(cardTypeId, {
      fieldId: fields[0].uuid,
      cardSide: 'front',
    });
    await this.cardTypeService.addField(cardTypeId, {
      fieldId: fields[1].uuid,
      cardSide: 'back',
    });
  }

  // Remove Workspace Data

  async removeWorkspace(workspaceId: string): Promise<void> {
    await this.workspaceService.removeWorkspace(workspaceId);
  }

  async removeUser(user: User): Promise<void> {
    await this.usersRepository.remove(user);
  }
}
