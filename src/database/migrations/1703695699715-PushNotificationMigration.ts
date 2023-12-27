import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { TableDB } from '../../commons/enums/table-db.enum';

export class PushNotificationMigration1703695699715 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.PUSH_NOTIFICATION,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'status',
            type: 'int',
          },
          {
            name: 'notification_title',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notification_body',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'device_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'topic',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TableDB.PUSH_NOTIFICATION);
  }
}
