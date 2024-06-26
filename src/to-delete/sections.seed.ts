import { Section } from 'src/sections/entities/section.entity';
import { DataSource } from 'typeorm';
import { getUsersInWorkspace } from './getUsersInWorkspace';
import { UserWorkspace } from 'src/user-workspaces/entities/user-workspace.entity';

export async function seedSections(
  AppDataSource: DataSource,
  workspaceId: string,
) {
  const sectionsRepository = AppDataSource.getRepository(Section);
  const userRepository = AppDataSource.getRepository(UserWorkspace);

  const users = await getUsersInWorkspace(userRepository, workspaceId);

  const sections = [];

  for (const user of users) {
    const sectionOne = new Section();
    sectionOne.name = 'Favorites';
    sectionOne.orderIndex = 0;
    sectionOne.user = user;
    sections.push(sectionOne);

    const sectionTwo = new Section();
    sectionTwo.name = 'Important';
    sectionTwo.orderIndex = 1;
    sectionTwo.user = user;
    sections.push(sectionTwo);
  }

  await sectionsRepository.insert(sections);
}
