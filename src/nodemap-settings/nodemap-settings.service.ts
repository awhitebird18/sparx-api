import { Injectable } from '@nestjs/common';
import { CreateNodemapSettingDto } from './dto/create-nodemap-setting.dto';
import { UpdateNodemapSettingDto } from './dto/update-nodemap-setting.dto';
import { NodemapSettings } from './entities/nodemap-setting.entity';
import { NodemapSettingsRepository } from './nodemap-settings.repository';
import { WorkspacesRepository } from 'src/workspaces/workspaces.repository';

@Injectable()
export class NodemapSettingsService {
  constructor(
    private nodemapSettingsRepository: NodemapSettingsRepository,
    private workspaceRepository: WorkspacesRepository,
  ) {}

  // Create a new nodemap setting for a user
  async create(
    userId: number,
    workspaceId: string,
    createNodemapSettingDto: CreateNodemapSettingDto,
  ): Promise<NodemapSettings> {
    const workspace = await this.workspaceRepository.findOneOrFail({
      where: { uuid: workspaceId },
    });

    const newSetting = this.nodemapSettingsRepository.create({
      user: { id: userId },
      workspace,
      ...createNodemapSettingDto,
    });

    return this.nodemapSettingsRepository.save(newSetting);
  }

  // Get all nodemap settings (not typically used but included for completeness)
  findAll(): Promise<NodemapSettings[]> {
    return this.nodemapSettingsRepository.find();
  }

  // Get nodemap settings for a specific user
  async findUserSettings(
    userId: string,
    workspaceId: string,
  ): Promise<NodemapSettings> {
    return await this.nodemapSettingsRepository.findOne({
      where: { user: { uuid: userId }, workspace: { uuid: workspaceId } },
    });
  }

  // Update nodemap settings for a specific user
  async update(
    uuid: string,
    updateNodemapSettingDto: UpdateNodemapSettingDto,
  ): Promise<NodemapSettings> {
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

    return await this.nodemapSettingsRepository.findOneOrFail({
      where: { uuid },
    });
  }

  // Remove nodemap settings (typically not necessary but included for completeness)
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
