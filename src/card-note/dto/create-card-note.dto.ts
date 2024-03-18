class FieldValueDto {
  uuid: string;
  value: string;
}

export class CreateCardNoteDto {
  templateId: string;
  fieldValues: FieldValueDto[];
  channelId: string;
}
