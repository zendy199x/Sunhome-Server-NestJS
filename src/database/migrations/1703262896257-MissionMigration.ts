import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { MissionStatus } from '../../commons/enums/mission-status.enum';
import { TableDB } from '../../commons/enums/table-db.enum';

export class MissionMigration1703262896257 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.MISSION,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: `uuid_generate_v4()`,
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'describe',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'total_cost',
            type: 'real',
          },
          {
            name: 'usage_cost',
            type: 'real',
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(MissionStatus),
            default: `'${MissionStatus.TODO}'`,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      TableDB.MISSION,
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.USER,
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createIndex(
      TableDB.MISSION,
      new TableIndex({
        name: 'created_by_id_idx',
        columnNames: ['created_by_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(TableDB.MISSION);

    const createByForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('created_by_id') !== -1
    );

    await queryRunner.dropForeignKeys(TableDB.MISSION, [createByForeignKey]);
    await queryRunner.dropIndex(TableDB.MISSION, 'created_by_id_idx');
    await queryRunner.dropTable(TableDB.MISSION);
  }
}
