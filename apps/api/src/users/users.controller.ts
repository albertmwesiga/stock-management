import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  me(@Request() req) { return this.users.me(req.user.id); }

  @Get()
  findAll() { return this.users.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.users.findOne(id); }
}
