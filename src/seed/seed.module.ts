import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CardTemplateModule } from 'src/card-template/card-template.module';
import { CardFieldModule } from 'src/card-field/card-field.module';
import { CardVariantModule } from 'src/card-variant/card-variant.module';
import { SectionsModule } from 'src/sections/sections.module';
import { UserWorkspacesModule } from 'src/user-workspaces/user-workspaces.module';
import { UsersModule } from 'src/users/users.module';
import { NodemapSettingsModule } from 'src/nodemap-settings/nodemap-settings.module';
import { ChannelsModule } from 'src/channels/channels.module';
import { ChannelSubscriptionsModule } from 'src/channel-subscriptions/channel-subscriptions.module';
import { WorkspacesModule } from 'src/workspaces/workspaces.module';

@Module({
  imports: [
    CardTemplateModule,
    CardFieldModule,
    CardVariantModule,
    SectionsModule,
    UserWorkspacesModule,
    UsersModule,
    NodemapSettingsModule,
    ChannelsModule,
    ChannelSubscriptionsModule,
    WorkspacesModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
