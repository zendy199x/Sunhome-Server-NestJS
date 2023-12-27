import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { TableDB } from '../../commons/enums/table-db.enum';

export class UserDeviceNotification1703695518259 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.USER_DEVICE,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'device_id',
            type: 'uuid',
            isPrimary: true,
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
      TableDB.USER_DEVICE,
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.USER,
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      TableDB.USER_DEVICE,
      new TableForeignKey({
        columnNames: ['device_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.DEVICE,
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userDeviceTable = await queryRunner.getTable(TableDB.USER_DEVICE);
    const userForeignKey = userDeviceTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('user_id') !== -1
    );

    const deviceForeignKey = userDeviceTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('device_id') !== -1
    );

    await queryRunner.dropForeignKeys(TableDB.USER_DEVICE, [userForeignKey, deviceForeignKey]);
    await queryRunner.dropTable(TableDB.USER_DEVICE);
  }
}
