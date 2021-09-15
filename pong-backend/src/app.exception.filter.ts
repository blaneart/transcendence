
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AvatarError } from './app.exceptions';

@Catch(AvatarError)
export class OtherExceptionFilter implements ExceptionFilter {
  catch(exception: AvatarError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST;

    response
      .status(status)
      .json({
        statusCode: status,
        // timestamp: new Date().toISOString(),
        // path: request.url,
      });
  }
}