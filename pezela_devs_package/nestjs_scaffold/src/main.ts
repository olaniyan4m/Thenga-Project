import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  getRoot() {
    return { message: 'Pezela API running' };
  }
}

@Module({
  controllers: [AppController],
  providers: [],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log('Listening on http://localhost:3000/api');
}

bootstrap();
