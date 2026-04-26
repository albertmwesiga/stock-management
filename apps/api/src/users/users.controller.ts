import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'List all users (Director only)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.DIRECTOR)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.DIRECTOR)
  @ApiOperation({ summary: 'Create a new user (Director only)' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles(Role.DIRECTOR)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.DIRECTOR)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
