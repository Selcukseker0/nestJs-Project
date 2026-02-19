import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771510207465 implements MigrationInterface {
    name = 'InitialSchema1771510207465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "denemeKolonu" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "denemeKolonu"`);
    }

}
