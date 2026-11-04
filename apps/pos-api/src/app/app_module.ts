import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app_controller';
import { AppService } from './app_service';
import { AuthModule } from '../modules/auth/auth_module';
import { CustomersModule } from '../modules/customers/customers_module';
import { InventoryModule } from '../modules/inventory/inventory_module';
import { PrismaModule } from '../modules/prisma/prisma_module';
import { ProductsModule } from '../modules/products/products_module';
import { ReportsModule } from '../modules/reports/reports_module';
import { SalesModule } from '../modules/sales/sales_module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    CustomersModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
