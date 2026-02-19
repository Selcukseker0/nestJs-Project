import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class UsersService {
constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly i18n: I18nService,
) {}

async create(email: string, password: string) {
    try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.userRepository.create({ email, password: hashedPassword });
    return await this.userRepository.save(user);
    } catch (error) {
    const lang = I18nContext.current()?.lang || 'en';

    if (error.code === '23505') {
        throw new ConflictException(
    this.i18n.t('user.email_exists', { lang })
        );
    }
    throw new InternalServerErrorException(
        this.i18n.t('user.error_occured', { lang })
    );
    }
}

findAll() {
    return this.userRepository.find();
}

delete(id: number) {
    return this.userRepository.delete(id);
}
}