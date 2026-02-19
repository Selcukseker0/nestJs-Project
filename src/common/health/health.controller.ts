import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Controller('health')
export class HealthController {
constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
) {}

@Get()
@HealthCheck()
check() {
    return this.health.check([
    () => this.db.pingCheck('database'),
    () => this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: { host: 'localhost', port: 6379 },
    }),
    () => this.microservice.pingCheck('kafka', {
        transport: Transport.KAFKA,
        options: { client: { brokers: ['localhost:9092'] } },
    }),
    ]);
}
}