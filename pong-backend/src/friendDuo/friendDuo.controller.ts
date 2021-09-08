import { Controller, Get, Put, Param, Delete, UseGuards, Request, HttpException, HttpCode, HttpStatus } from '@nestjs/common';
import { FriendDuoService } from './friendDuo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
export class FriendDuoController {
  constructor( private readonly friendDuoService: FriendDuoService)  {
  }

  // Create a new duo with given ids
  @UseGuards(JwtAuthGuard)
  @Put('/:id1/:id2')
  async AddFriend(@Request() request, @Param('id1') id1: number, @Param('id2') id2: number)
  {
    console.log('addFriend');
    // Create the duo using the service
    return await this.friendDuoService.createDuo(id1, id2);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id1/:id2')
  async RemoveFriend(@Request() request, @Param('id1') id1: number, @Param('id2') id2: number)
  {
    // Find the duo by id1
    console.log('removeFriend');
    const response = await this.friendDuoService.getDuoId(id1, id2);

    if (!response)
    {
      throw new HttpException("Friend duo not found", HttpStatus.BAD_REQUEST);
    }

    // Actually delete the duo
    return await this.friendDuoService.deleteDuo(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id1/:id2')
  async getFriendDuo(@Request() request, @Param('id1') id1: number, @Param('id2') id2: number)
  {
    const id = await this.friendDuoService.getDuoId(id1, id2);
    console.log('here getFriendDuoId DB');
    console.log(id);
    return id;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/exist/:id1/:id2')
  async getDuoExistence(@Request() request, @Param('id1') id1: number, @Param('id2') id2: number)
  {
    const bool = await this.friendDuoService.DoesDuoExist(id1, id2);
    console.log('here getFRIEND DB');
    console.log(bool);
    return bool;
  }
}