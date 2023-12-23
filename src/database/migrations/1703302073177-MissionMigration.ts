import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { MissionStatus } from '../../commons/enums/mission-status.enum';
import { TableDB } from '../../commons/enums/table-db.enum';

export class MissionMigration1703302073177 implements MigrationInterface {
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
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'describe',
            type: 'varchar',
          },
          {
            name: 'total_cost',
            type: 'real',
            default: 0,
          },
          {
            name: 'usage_cost',
            type: 'real',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(MissionStatus),
            enumName: 'mission_status_enum',
            default: `'${MissionStatus.TO_DO}'`,
          },
          {
            name: 'created_by_id',
            type: 'uuid',
          },
          {
            name: 'project_id',
            type: 'uuid',
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
      TableDB.MISSION,
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.USER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      TableDB.MISSION,
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.PROJECT,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createIndex(
      TableDB.MISSION,
      new TableIndex({
        name: 'mission_created_by_id_idx',
        columnNames: ['created_by_id'],
      })
    );

    await queryRunner.createIndex(
      TableDB.MISSION,
      new TableIndex({
        name: 'mission_project_id_idx',
        columnNames: ['project_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const missionTable = await queryRunner.getTable(TableDB.MISSION);
    const createdByForeignKey = missionTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('created_by_id') !== -1
    );
    const projectForeignKey = missionTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('project_id') !== -1
    );
    await queryRunner.dropForeignKeys(TableDB.MISSION, [createdByForeignKey, projectForeignKey]);
    await queryRunner.dropIndex(TableDB.MISSION, 'mission_created_by_id_idx');
    await queryRunner.dropIndex(TableDB.MISSION, 'mission_project_id_idx');
    await queryRunner.dropTable(TableDB.MISSION);
  }
}
