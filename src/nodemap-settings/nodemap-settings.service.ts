import { Injectable } from '@nestjs/common';
import { CreateNodemapSettingDto } from './dto/create-nodemap-setting.dto';
import { UpdateNodemapSettingDto } from './dto/update-nodemap-setting.dto';
import { NodemapSettingsRepository } from './nodemap-settings.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';
import { plainToInstance } from 'class-transformer';
import { NodemapSettingsDto } from './dto/nodemap-settings.dto';

@Injectable()
export class NodemapSettingsService {
  constructor(
    private nodemapSettingsRepository: NodemapSettingsRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  async create(
    userId: number,
    workspaceId: string,
    createNodemapSettingDto: CreateNodemapSettingDto,
  ): Promise<NodemapSettingsDto> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const newSetting = this.nodemapSettingsRepository.create({
      user: { id: userId },
      workspace,
      ...createNodemapSettingDto,
    });

    const nodemapSettings = this.nodemapSettingsRepository.save(newSetting);

    return plainToInstance(NodemapSettingsDto, nodemapSettings);
  }

  async findUserSettings(
    userId: string,
    workspaceId: string,
  ): Promise<NodemapSettingsDto> {
    const nodemapSettings = await this.nodemapSettingsRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
    });

    return plainToInstance(NodemapSettingsDto, nodemapSettings);
  }

  async update(
    uuid: string,
    updateNodemapSettingDto: UpdateNodemapSettingDto,
  ): Promise<NodemapSettingsDto> {
    const settings = await this.nodemapSettingsRepository.findOneOrFail({
      where: { uuid },
    });

    if (!settings) {
      throw new Error(`Nodemap settings not found for user #${uuid}`);
    }

    await this.nodemapSettingsRepository.update(
      { id: settings.id },
      updateNodemapSettingDto,
    );

    const nodemapSettings = await this.nodemapSettingsRepository.findOneOrFail({
      where: { uuid },
    });

    return plainToInstance(NodemapSettingsDto, nodemapSettings);
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
