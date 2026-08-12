import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { EvaluationsModule } from './evaluations/evaluations.module';

@Module({
  imports: [PrismaModule, UsersModule, TasksModule, EvaluationsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
