import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const avatarUrls = [
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935603/avatar-29_aozto0.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935602/avatar-28_usmcsy.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935602/avatar-27_stitwg.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935601/avatar-26_no7zzg.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935599/avatar-25_kvl2nh.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935597/avatar-24_z1rrzz.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935597/avatar-23_twik1m.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935596/avatar-22_ne1lqs.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935596/avatar-21_gmgvx8.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935595/avatar-20_hwsosh.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935593/avatar-19_sqyr5v.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935591/avatar-17_u53g5f.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935591/avatar-18_grxth6.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935590/avatar-16_j7e4og.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935590/avatar-15_wwpx4h.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935589/avatar-14_arpjs4.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935585/avatar-13_taxzai.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935584/avatar-12_lp96wo.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935584/avatar-11_qfu7zp.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935584/avatar-10_qr88eb.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935584/avatar-9_buwemv.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935583/avatar-8_rqkbc3.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935577/avatar-7_hdrkuw.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935577/avatar-6_fctuu6.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935572/avatar-2_obkfrb.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935572/avatar-4_l0omv0.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935572/avatar-5_drsitc.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935572/avatar-1_xkn4zr.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935572/avatar-3_afzi2t.svg',
  'https://res.cloudinary.com/dwkvw91pm/image/upload/v1711935571/avatar-0_iece16.svg',
];

export async function seedUsers(AppDataSource: DataSource) {
  // Seeding logic here
  const userRepository = AppDataSource.getRepository(User);

  const users = [];

  const hashedPassword = await bcrypt.hash('Password1', 10);

  const bots = await userRepository.find();

  await userRepository.remove(bots);

  for (let i = 0; i < 10; i++) {
    const newUser = new User();

    const firstName = faker.person.firstName('male');
    const lastName = faker.person.lastName('male');

    newUser.firstName = faker.person.firstName('male');
    newUser.lastName = faker.person.lastName('male');
    newUser.email = faker.internet.email({ firstName, lastName });
    newUser.password = hashedPassword;
    newUser.profileImage = avatarUrls[i];
    newUser.isBot = true;

    users.push(newUser);
  }

  // users.push(...defaultUsers);

  // Set other properties as needed
  return await userRepository.save(users);
}
