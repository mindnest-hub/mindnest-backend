import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('AllExceptionsFilter');

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Log detailed error on server
        this.logger.error(
            `Exception: ${exception instanceof Error ? exception.message : exception}`,
            exception instanceof Error ? exception.stack : '',
        );

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Internal Server Error'
                : (exception instanceof HttpException ? exception.getResponse() : 'An error occurred'),
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
