# Deploy & Run

Gereken servisler:
- Postgres
- Redis
- Kafka (+ Zookeeper gerekebilir)

Yerel çalıştırma:

```bash
cp .env.example .env
# düzenle .env içeriğini gerekliyse
npm install
npm run start:dev
```

Docs üretimi (TypeDoc):

```bash
npm install
npm run docs:typedoc
```

Swagger UI: `http://localhost:3000/api`

CI: docs üretimini `npm run docs:typedoc` şeklinde çalıştırıp `docs/typedoc` çıktısını publish edebilirsiniz (GitHub Pages veya Netlify).
