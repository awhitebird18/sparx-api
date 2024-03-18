import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from 'src/channels/entities/channel.entity'; // Adjust the path as needed
import { BaseEntity } from 'src/common/entities/base.entity';
import { ConnectionSide } from '../enums/connectionSide.enum';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Entity()
export class ChannelConnector extends BaseEntity {
  @Column({ type: 'enum', enum: ConnectionSide })
  childSide: ConnectionSide;

  @Column({ type: 'enum', enum: ConnectionSide })
  parentSide: ConnectionSide;

  @ManyToOne(() => Workspace, (workspace) => workspace.channelConnectors)
  workspace: Workspace;

  @ManyToOne(() => Channel, (channel) => channel.parentConnectors, {
    cascade: ['soft-remove'],
  })
  @JoinColumn()
  childChannel: Channel;

  @ManyToOne(() => Channel, (channel) => channel.childConnectors, {
    cascade: ['soft-remove'],
  })
  @JoinColumn()
  parentChannel: Channel;
}
