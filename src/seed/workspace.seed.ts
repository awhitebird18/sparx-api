// import { faker } from '@faker-js/faker';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { DataSource } from 'typeorm';

export async function seedWorkspaces(AppDataSource: DataSource) {
  const workspaceRepository = AppDataSource.getRepository(Workspace);

  // const workspaces = [];

  // for (let i = 0; i < 30; i++) {
  //   const workspace = new Workspace();

  //   workspace.name = faker.word.noun();

  //   workspaces.push(workspace);
  // }

  const workspace = workspaceRepository.create({
    name: 'Full Stack Development',
  });

  await workspaceRepository.save(workspace);
}
