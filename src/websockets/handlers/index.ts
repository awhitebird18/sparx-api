import { channelHandlers } from './channel-handlers';
import { sectionHandlers } from './section-handlers';
import { messageHandlers } from './message-handlers';
import { userStatusHandlers } from './user-status-handlers';
import { userHandlers } from './user-handlers';
import { channelConnectorHandlers } from './channel-connector-handlers';

export default {
  ...channelHandlers,
  ...sectionHandlers,
  ...messageHandlers,
  ...userStatusHandlers,
  ...userHandlers,
  ...channelConnectorHandlers,
};
