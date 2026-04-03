import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { SkillService } from '../skill/skill.service';
import { CvService } from '../cv/cv.service';
import { User } from '../user/entities/user.entity';
import { Skill } from '../skill/entities/skill.entity';
import {
  randFirstName,
  randLastName,
  randNumber,
  randJobTitle,
  randEmail,
  randUserName,
  randSkill,
} from '@ngneat/falso';
import { Role } from 'src/shared/enums/role.enum';

async function bootstrap() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const skillService = app.get(SkillService);
  const cvService = app.get(CvService);

  logger.log('Démarrage du seeding\n');

  //1. Seed Skills
  const skills: Skill[] = [];
  for (let i = 0; i < 5; i++) {
    const skill = await skillService.create({
      designation: randSkill()[0],
    });
    skills.push(skill);
    logger.log(`Skill créé : ${skill.designation}`);
  }
  logger.log(`\n${skills.length} Skills créés\n`);

  //2. Seed Users
  const users: User[] = [];
  for (let i = 0; i < 3; i++) {
    const user = await userService.create({
      username: randUserName(),
      role: Role.USER,
      email: randEmail(),
      password: 'password123',
    });
    users.push(user);
    logger.log(`User créé : ${user.username} (${user.email})`);
  }
  logger.log(`\n${users.length} Users créés\n`);

  //3. Seed CVs
  for (let i = 0; i < 10; i++) {
    const cv = await cvService.createForOwner(
      {
        name: randLastName(),
        firstname: randFirstName(),
        age: randNumber({ min: 22, max: 50 }),
        cin: `TN${randNumber({ min: 10000000, max: 99999999 })}`,
        job: randJobTitle(),
        path: '',
        skillIds: [
          skills[i % skills.length].id,
          skills[(i + 1) % skills.length].id,
        ],
      },
      users[i % users.length].id,
    );
    logger.log(`CV créé : ${cv.firstname} ${cv.name} — ${cv.job}`);
  }
  logger.log(`\n 10 CVs créés\n`);

  logger.log('Seeding terminé avec succès');
  await app.close();
}

bootstrap();
