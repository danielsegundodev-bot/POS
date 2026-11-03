import { Module } from '@nestjs/common';
import { AppController } from './app_controller';
import { AppService } from './app_service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
