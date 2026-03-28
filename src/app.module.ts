import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { CampagnesModule } from './campagnes/campagnes.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';


const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: process.env.NODE_ENV === 'test'
      ? path.resolve(process.cwd(), '.env.test')
      : undefined,
  }),
  JwtModule.register({
    global: true,
    secret:
      process.env.JWT_SECRET ||
      'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
    signOptions: { expiresIn: '1h' },
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      type: 'postgres',
      host: config.get<string>('DATABASE_HOST') || 'wefund-projects-db',
      port: parseInt(config.get<string>('DATABASE_PORT') || '5432'),
      username: config.get<string>('DATABASE_USER') || 'postgres',
      password: config.get<string>('DATABASE_PASSWORD') || 'password',
      database: config.get<string>('DATABASE_NAME') || 'wefund_projects_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  }),
  ScheduleModule.forRoot(),
  ProjectsModule,
  CampagnesModule,
];
if (process.env.NODE_ENV !== 'test') {
  imports.push(
    ClientsModule.register([
      {
        name: 'KafkaProducer',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'wefund-projects-service',
            brokers: [process.env.KAFKA_BROKER || 'redpanda:9092'],
          },
          consumer: {
            groupId: 'wefund-projects-service-consumer',
          },
        },
      },
    ])
  );
}

@Module({
  imports,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}