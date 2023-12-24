import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { ProjectStatus } from '../../commons/enums/project-status.enum';
import { TableDB } from '../../commons/enums/table-db.enum';

export class ProjectMigration1703301706315 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.PROJECT,
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
            name: 'status',
            type: 'enum',
            enum: Object.values(ProjectStatus),
            enumName: 'project_status_enum',
            default: `'${ProjectStatus.TO_DO}'`,
          },
          {
            name: 'created_by_id',
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
      TableDB.PROJECT,
      new TableForeignKey({
        columnNames: ['created_by_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.USER,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createIndex(
      TableDB.PROJECT,
      new TableIndex({
        name: 'project_created_by_id_idx',
        columnNames: ['created_by_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const projectTable = await queryRunner.getTable(TableDB.PROJECT);
    const createByForeignKey = projectTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('created_by_id') !== -1
    );
    await queryRunner.dropForeignKeys(TableDB.PROJECT, [createByForeignKey]);
    await queryRunner.dropIndex(TableDB.PROJECT, 'project_created_by_id_idx');
    await queryRunner.dropTable(TableDB.PROJECT);
  }
}
