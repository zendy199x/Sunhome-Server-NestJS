import { AuthService } from '@/auth/auth.service';
import { AuthCredentialsDto } from '@/auth/dto/auth-credentials.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(authCredentialsDto: AuthCredentialsDto): Promise<any> {
    const user = await this.authService.signIn(authCredentialsDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
