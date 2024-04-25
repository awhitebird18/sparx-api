import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { SectionsService } from 'src/sections/sections.service';
import { UserPreferencesService } from 'src/user-preferences/user-preferences.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CardFieldRepository } from 'src/card-field/card-field.repository';
import { CardVariantRepository } from 'src/card-variant/card-variant.repository';
import { CardTemplateRepository } from 'src/card-template/card-template.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private sectionsService: SectionsService,
    private userPreferencesService: UserPreferencesService,
    private cloudinaryService: CloudinaryService,
    private events: EventEmitter2,
    private cardTemplateRepository: CardTemplateRepository,
    private cardFieldRepository: CardFieldRepository,
    private cardTypeRepository: CardVariantRepository,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        email: registerDto.email,
      },
    });
    if (existingUser)
      throw new ConflictException('Email is already registered');

    const user = await this.usersRepository.createUser(registerDto);

    await Promise.all([
      this.seedUserDefaultTemplate(user),
      this.sectionsService.seedUserDefaultSections(user),
      this.userPreferencesService.createUserPreferences(user),
    ]);

    return user;
  }

  async seedUserDefaultTemplate(user: User): Promise<any> {
    const defaultExists = await this.cardTemplateRepository.find({
      where: { user: { id: user.id }, isDefault: true },
    });
    if (defaultExists) return;

    const newTemplate = this.cardTemplateRepository.create({
      user,
      title: 'Default',
      isDefault: true,
    });

    const template = await this.cardTemplateRepository.save(newTemplate);

    const frontField = await this.cardFieldRepository.create({
      template,
      title: 'Front side',
    });
    const backField = await this.cardFieldRepository.create({
      template,
      title: 'Back side',
    });

    await Promise.all([
      this.cardFieldRepository.save(frontField),
      this.cardFieldRepository.save(backField),
    ]);

    const cardVariant = await this.cardTypeRepository.create({
      template,
      title: 'Card 1: Front side > Back side',
      frontFields: [frontField],
      backFields: [backField],
    });
    await this.cardTypeRepository.save(cardVariant);
  }

  async updateUserPassword(
    userId: number,
    hashedPassword: string,
  ): Promise<any> {
    const res = await this.usersRepository.update(userId, {
      password: hashedPassword,
    });

    if (res.affected === 0) {
      throw new Error('Unable to update user');
    }
  }

  findOne(searchProperties: any): Promise<User> {
    return this.usersRepository.findOneBy(searchProperties);
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email, isVerified: true } });
  }

  async findWorkspaceUsers(workspaceId: string): Promise<UserDto[]> {
    const users = await this.usersRepository.findWorkspaceUsers(workspaceId);

    const result = users.map((u: any) => {
      if (u.customStatuses.length) {
        u.status = u.customStatuses[0];
      }
      delete u.customStatuses;

      return u;
    });

    return result;
  }

  async markAsVerified(email: string): Promise<User> {
    const user = await this.usersRepository.findOneOrFail({ where: { email } });

    Object.assign(user, { isVerified: true });
    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneOrFail({
      where: { uuid: userId },
    });

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    this.events.emit('websocket-event', 'updateUser', updatedUser);

    return updatedUser;
  }

  async updateProfileImage(
    userId: number,
    profileImage: string,
  ): Promise<User> {
    // Find User
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });

    const uploadedImageUrl = await this.cloudinaryService.upload(
      profileImage,
      user.uuid,
    );

    user.profileImage = uploadedImageUrl;

    const updatedUser = await this.usersRepository.save(user);

    this.events.emit('websocket-event', 'updateUser', updatedUser);

    return updatedUser;
  }

  async remove(uuid: string): Promise<void> {
    const removedUser = await this.usersRepository.removeUserByUuid(uuid);

    if (!removedUser)
      throw new NotFoundException(`Unable to find user with id ${uuid}`);

    this.events.emit('websocket-event', 'removeUser', removedUser.uuid);
  }
}
