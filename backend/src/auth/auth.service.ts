import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from '../users/dto/signup.dto';
import { SigninDto } from '../users/dto/signin.dto';
import { RefreshDto } from '../users/dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignupDto) {
    let user: UserDocument;

    try {
      user = await this.userModel.create(dto);
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }

    const payload = { sub: user._id.toString(), email: user.email };

    return {
      user: { _id: user._id.toString(), name: user.name, email: user.email },
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async signIn(dto: SigninDto) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user._id.toString(), email: user.email };

    return {
      user: { _id: user._id.toString(), name: user.name, email: user.email },
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refresh(dto: RefreshDto) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(dto.refreshToken);

      return {
        access_token: this.jwtService.sign({ sub: payload.sub, email: payload.email }),
        refresh_token: this.jwtService.sign({ sub: payload.sub, email: payload.email }, { expiresIn: '7d' }),
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('name email');

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
