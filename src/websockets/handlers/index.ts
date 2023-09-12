import { channelHandlers } from './channel-handlers';
import { sectionHandlers } from './section-handlers';
import { messageHandlers } from './message-handlers';

export default { ...channelHandlers, ...sectionHandlers, ...messageHandlers };
