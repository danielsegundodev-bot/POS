import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpdateSettingsDto } from './dto/update_settings_dto';
import { SettingsService } from './settings_service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Put()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
