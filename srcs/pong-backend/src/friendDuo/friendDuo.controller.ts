import { Controller, Get, Put, Param, Delete, UseGuards, Request, HttpException, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { FriendDuoService } from './friendDuo.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
export class FriendDuoController {
  constructor( private readonly friendDuoService: FriendDuoService)  {
  }

  // Create a new duo with given ids
  @UseGuards(JwtAuthGuard)
  @Put('/:id1/:id2')
  async AddFriend(@Request() request, @Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number)
  {
    // Create the duo using the service
    if (id1 != id2)
      return await this.friendDuoService.createDuo(id1, id2);
    return ;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id1/:id2')
  async RemoveFriend(@Request() request, @Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number)
  {
    // Find the duo by id1
    const response = await this.friendDuoService.getDuoId(id1, id2);

    if (!response)
    {
      throw new HttpException("Friend duo not found", HttpStatus.BAD_REQUEST);
    }

    // Actually delete the duo
    return await this.friendDuoService.deleteDuo(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('of/:id1')
  async getFriendsOf(@Request() request, @Param('id1', ParseIntPipe) id1: number)
  {
    const array = await this.friendDuoService.getFriendsArray(id1);
    return array;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id1/:id2')
  async getFriendDuo(@Request() request, @Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number)
  {
    const id = await this.friendDuoService.getDuoId(id1, id2);
    return id;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/exist/:id1/:id2')
  async getDuoExistence(@Request() request, @Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number)
  {
    const bool = await this.friendDuoService.DoesDuoExist(id1, id2);
    return bool;
  }
}