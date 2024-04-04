import { CardType } from 'src/card-type/entities/card-type.entity';
import { User } from '../users/entities/user.entity';
import { Template } from 'src/card-template/entities/card-template.entity';
import { Field } from 'src/card-field/entities/card-field.entity';

export async function seedFlashcardTemplate(AppDataSource) {
  const userRepository = AppDataSource.getRepository(User);
  const cardTemplateRepository = AppDataSource.getRepository(Template);
  const cardTypeRepository = AppDataSource.getRepository(CardType);
  const cardFieldRepository = AppDataSource.getRepository(Field);

  const user = await userRepository.findOne({
    where: { email: 'aaron.whitebird@gmail.com' },
  });

  //   Template
  const cardTemplate = new Template();
  cardTemplate.isDefault = true;
  cardTemplate.user = user;
  cardTemplate.title = 'Basic';

  const savedTemplate = await cardTemplateRepository.save(cardTemplate);

  //   Fields
  const frontField = new Field();
  frontField.title = 'Front';
  frontField.template = savedTemplate;

  const backField = new Field();
  backField.title = 'Back';
  backField.template = savedTemplate;

  const savedFields = await cardFieldRepository.insert([frontField, backField]);

  //   Variant
  const cardType = new CardType();
  cardType.title = 'Front > Back';
  cardType.template = savedTemplate;
  cardType.frontFields = [savedFields[0]];
  cardType.backFields = [savedFields[1]];

  await cardTypeRepository.save(cardType);
}
