import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
@IsString()
@IsNotEmpty({ message: 'Başlık boş bırakılamaz' })
title: string;

@IsString()
@IsOptional()
description?: string;

@IsEnum(TaskStatus)
@IsOptional()
status?: TaskStatus;

@IsDateString({}, { message: 'Geçersiz tarih formatı (ISO 8601 beklenen)' })
@IsOptional()
expireTime?: Date;
}