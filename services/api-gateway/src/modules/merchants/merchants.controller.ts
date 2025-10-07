import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto, UpdateMerchantDto } from './dto';

@ApiTags('merchants')
@Controller('merchants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get merchant profile' })
  @ApiResponse({ status: 200, description: 'Merchant profile retrieved successfully' })
  async getProfile(@Param('userId') userId: string) {
    return this.merchantsService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update merchant profile' })
  @ApiResponse({ status: 200, description: 'Merchant profile updated successfully' })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantsService.updateProfile(userId, updateMerchantDto);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get merchant settings' })
  @ApiResponse({ status: 200, description: 'Merchant settings retrieved successfully' })
  async getSettings(@Param('userId') userId: string) {
    return this.merchantsService.getSettings(userId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update merchant settings' })
  @ApiResponse({ status: 200, description: 'Merchant settings updated successfully' })
  async updateSettings(
    @Param('userId') userId: string,
    @Body() settings: any,
  ) {
    return this.merchantsService.updateSettings(userId, settings);
  }
}
