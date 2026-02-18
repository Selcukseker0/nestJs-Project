# Mimari

- Framework: NestJS
- Veri erişimi: TypeORM + Postgres
- Cache: Redis (Keyv adapter)
- Messaging: Kafka (kafkajs / NestJS microservices)
- Auth: Passport + JWT

Modüller:
- `AuthModule` - kimlik doğrulama (JWT)
- `UsersModule` - kullanıcı CRUD
- `TasksModule` - kullanıcıya ait görev CRUD, Kafka ile eventi publish
- `Common` - middleware, interceptor, exception filter

Konfigürasyon env ile sağlanır (`.env` veya ortam değişkenleri).