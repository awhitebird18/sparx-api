import { Injectable } from '@nestjs/common';
import { CreateNodemapSettingDto } from './dto/create-nodemap-setting.dto';
import { UpdateNodemapSettingDto } from './dto/update-nodemap-setting.dto';
import { NodemapSettingsRepository } from './nodemap-settings.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { plainToInstance } from 'class-transformer';
import { NodemapSettingsDto } from './dto/nodemap-settings.dto';
import { NodemapSettings } from './entities/nodemap-setting.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class NodemapSettingsService {
  constructor(
    private nodemapSettingsRepository: NodemapSettingsRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  convertToDto(nodemapSettings: NodemapSettings): NodemapSettingsDto {
    return plainToInstance(NodemapSettingsDto, nodemapSettings);
  }

  async create(
    userId: number,
    workspaceId: string,
    createNodemapSettingDto: CreateNodemapSettingDto,
  ): Promise<NodemapSettingsDto> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const newSettings = this.nodemapSettingsRepository.create({
      user: { id: userId },
      workspace,
      ...createNodemapSettingDto,
    });

    const nodemapSettings = await this.nodemapSettingsRepository.save(
      newSettings,
    );

    return this.convertToDto(nodemapSettings);
  }

  async findUserSettings(
    userId: string,
    workspaceId: string,
  ): Promise<NodemapSettingsDto> {
    const nodemapSettings = await this.nodemapSettingsRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
    });

    return this.convertToDto(nodemapSettings);
  }

  async update(
    workspaceId: string,
    user: User,
    updateNodemapSettingDto: UpdateNodemapSettingDto,
  ): Promise<NodemapSettingsDto> {
    const settings = await this.nodemapSettingsRepository.findOneOrFail({
      where: { workspace: { uuid: workspaceId }, user: { uuid: user.uuid } },
    });

    if (!settings) {
      throw new Error(`Nodemap settings not found for user #${user.uuid}`);
    }

    await this.nodemapSettingsRepository.update(
      { id: settings.id },
      updateNodemapSettingDto,
    );

    const nodemapSettings = await this.nodemapSettingsRepository.findOneOrFail({
      where: { uuid: settings.uuid },
    });

    return this.convertToDto(nodemapSettings);
  }

  async remove(userId: string): Promise<void> {
    const settings = await this.nodemapSettingsRepository.findOne({
      where: { uuid: userId },
    });
    if (!settings) {
      throw new Error(`Nodemap settings not found with id #${userId}`);
    }

    await this.nodemapSettingsRepository.remove(settings);
  }
}
