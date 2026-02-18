import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
@Injectable()
export class UsersService {
constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
) {}

async create(email: string, password: string) {
    try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({ 
        email, 
        password: hashedPassword 
    });
    return await this.userRepository.save(user);
    } catch (error) {
    if (error.code === '23505') {
        throw new ConflictException('Bu e-posta adresi zaten kullanimda!');
    }
    throw new InternalServerErrorException('Kullanici kaydedilirken bir hata oluştu');
    }
}
delete(id: number) {
    return this.userRepository.delete(id);
}
findAll() {
    return this.userRepository.find();
}
}