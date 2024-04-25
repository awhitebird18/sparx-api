import { channelHandlers } from './channel-handlers';
import { sectionHandlers } from './section-handlers';
import { messageHandlers } from './message-handlers';
import { userStatusHandlers } from './user-status-handlers';
import { userHandlers } from './user-handlers';

export default {
  ...channelHandlers,
  ...sectionHandlers,
  ...messageHandlers,
  ...userStatusHandlers,
  ...userHandlers,
};
