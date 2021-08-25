import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TemporaryJwtAuthGuard extends AuthGuard('temporary-jwt') {}