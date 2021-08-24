import { Controller, Get, Post, Body, Res, HttpStatus, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';



@Controller('profile')
export class ProfileController {
    constructor( private readonly profileService: ProfileService)
    {}
    @Get(':id')
    show(@Param('id') id: string, @Res() res)
    {
        return this.profileService.show(id, res);
    }
    
}
