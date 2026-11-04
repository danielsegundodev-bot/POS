import { config } from 'dotenv';
import { resolve } from 'path';

config({
  path: [resolve('apps/pos-api/.env'), resolve('apps/pos-api/prisma/.env')],
});
