import { Module } from '@nestjs/common';
import { FriendDuoService } from './friendDuo.service';
import { FriendDuoController } from './friendDuo.controller';

@Module({
  providers: [FriendDuoService],
  controllers: [FriendDuoController]
})
export class FriendDuoModule {}
