import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { NodemapSettingsService } from './nodemap-settings.service';
import { CreateNodemapSettingDto } from './dto/create-nodemap-setting.dto';
import { UpdateNodemapSettingDto } from './dto/update-nodemap-setting.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { NodemapSettingsDto } from './dto/nodemap-settings.dto';

@Controller('nodemap-settings')
export class NodemapSettingsController {
  constructor(
    private readonly nodemapSettingsService: NodemapSettingsService,
  ) {}

  @Post(':workspaceId')
  create(
    @Param('workspaceId') workspaceId: string,
    @GetUser() user: User,
    @Body() createNodemapSettingDto: CreateNodemapSettingDto,
  ): Promise<NodemapSettingsDto> {
    return this.nodemapSettingsService.create(
      user.id,
      workspaceId,
      createNodemapSettingDto,
    );
  }

  @Get(':workspaceId')
  findUserSettings(
    @Param('workspaceId') workspaceId: string,
    @GetUser() user: User,
  ): Promise<NodemapSettingsDto> {
    return this.nodemapSettingsService.findUserSettings(user.uuid, workspaceId);
  }

  @Patch(':uuid')
  updateUserSettings(
    @Param('uuid') uuid: string,
    @GetUser() user: User,
    @Body() updateNodemapSettingDto: UpdateNodemapSettingDto,
  ): Promise<NodemapSettingsDto> {
    return this.nodemapSettingsService.update(uuid, updateNodemapSettingDto);
  }

  @Delete('user')
  removeUserSettings(@GetUser() user: User) {
    return this.nodemapSettingsService.remove(user.uuid);
  }
}
