import { Module } from '@nestjs/common';
import { SettingsController } from './settings_controller';
import { SettingsService } from './settings_service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
