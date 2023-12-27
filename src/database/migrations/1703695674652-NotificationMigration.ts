import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { TableDB } from '../../commons/enums/table-db.enum';

export class NotificationMigration1703695674652 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.NOTIFICATION,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'object_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'object_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'related_object_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'actor_id',
            type: 'uuid',
          },
          {
            name: 'target_id',
            type: 'uuid',
          },
          {
            name: 'read_at',
            type: 'timestamptz',
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

    await queryRunner.createForeignKey(
      TableDB.NOTIFICATION,
      new TableForeignKey({
        columnNames: ['actor_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.USER,
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      TableDB.NOTIFICATION,
      new TableForeignKey({
        columnNames: ['target_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.USER,
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const notificationTable = await queryRunner.getTable(TableDB.NOTIFICATION);
    const userForeignKey = notificationTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('actor_id') !== -1
    );
    const targetUserForeignKey = notificationTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('target_id') !== -1
    );

    await queryRunner.dropForeignKeys(TableDB.NOTIFICATION, [userForeignKey, targetUserForeignKey]);
    await queryRunner.dropTable(TableDB.NOTIFICATION);
  }
}
