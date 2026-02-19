import {
ExceptionFilter,
Catch,
ArgumentsHost,
HttpException,
HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Catch() // Boş bırakırsak SADECE HttpException değil, her şeyi yakalar (DB hataları dahil)
export class AllExceptionsFilter implements ExceptionFilter {
catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const i18n = I18nContext.current(host);

    // Status belirle: HttpException ise oradan al, değilse 500 (Internal Server Error) ver
    const status = exception instanceof HttpException 
    ? exception.getStatus() 
    : HttpStatus.INTERNAL_SERVER_ERROR;

    // Hata mesajını ayıkla (DTO validasyon hataları dizi olarak gelebilir, onları da çözer)
    const exceptionResponse: any = exception instanceof HttpException ? exception.getResponse() : null;
    let message = exception.message || 'INTERNAL_SERVER_ERROR';

    if (exceptionResponse && typeof exceptionResponse === 'object') {
    message = exceptionResponse.message || message;
    }

    // --- KRİTİK NOKTA: i18n Çevirisi ---
    // i18n dosyanızda (örn: tr.json) "errors" altında bu mesajın karşılığı varsa onu döner
    const translatedMessage = i18n 
    ? i18n.t(`errors.${Array.isArray(message) ? message[0] : message}`) 
    : (Array.isArray(message) ? message[0] : message);

    response.status(status).json({
    success: false,
    statusCode: status,
      message: translatedMessage, // Artık çevrilmiş mesaj!
    path: request.url,
    timestamp: new Date().toISOString(),
    });
}
}