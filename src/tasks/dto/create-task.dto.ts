import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n'; // Bunu ekle

export class CreateTaskDto {
@IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.NOT_EMPTY') }) // Anahtarı veriyoruz
@ApiProperty({ example: 'Görev başlığı', description: 'Görev başlığı' })
title: string;

@IsString()
@IsOptional()
@ApiProperty({ example: 'Görev açıklaması', description: 'Görev açıklaması' })
description?: string;

@IsEnum(TaskStatus, { message: i18nValidationMessage('validation.INVALID_ENUM') })
@IsOptional()
@ApiProperty({ example: 'PENDING', description: 'Görev durumu (PENDING, IN_PROGRESS, COMPLETED)' })
status?: TaskStatus;

@IsDateString({}, { message: i18nValidationMessage('validation.INVALID_DATE') })
@IsOptional()
@ApiProperty({ example: '2025-12-31T23:59:59Z', description: 'Görevin son tarihi' })
expireTime?: Date;
}