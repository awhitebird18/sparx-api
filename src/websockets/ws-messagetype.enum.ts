export enum MessageType {
  NewUser = 'NEW_USER',
  UpdateUser = 'UPDATE_USER',
  RemoveUser = 'REMOVE_USER',
  JoinChannel = 'JOIN_CHANNEL',
  LeaveChannel = 'LEAVE_CHANNEL',
  UpdateSection = 'UPDATE_SECTION',
  RemoveSection = 'REMOVE_SECTION',
  RemoveChannelFromSection = 'REMOVE_CHANNEL_FROM_SECTION',
  AddChannelToSection = 'ADD_CHANNEL_TO_SECTION',
  ReorderSections = 'REORDER_SECTIONS',
}
