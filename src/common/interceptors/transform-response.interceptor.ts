import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const TRANSFORM_RESPONSE_METADATA_KEY =
  'transform_response_metadata_key';

export const TransformResponse = (dtoClass: Type<any>): MethodDecorator => {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(
      TRANSFORM_RESPONSE_METADATA_KEY,
      dtoClass,
      descriptor.value,
    );
    return descriptor;
  };
};

// Interceptor
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const target = context.getHandler();
        const dtoClass = Reflect.getMetadata(
          TRANSFORM_RESPONSE_METADATA_KEY,
          target,
        );

        if (dtoClass) {
          return plainToInstance(dtoClass, data, {
            excludeExtraneousValues: true,
          });
        }

        return data;
      }),
    );
  }
}
