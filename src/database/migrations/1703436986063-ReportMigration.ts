import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { MissionStatus } from '../../commons/enums/mission-status.enum';
import { TableDB } from '../../commons/enums/table-db.enum';

export class ReportMigration1703436986063 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.REPORT,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'mission_id',
            type: 'uuid',
          },
          {
            name: 'participant_id',
            type: 'uuid',
          },
          {
            name: 'sender_id',
            type: 'uuid',
          },
          {
            name: 'new_usage_cost',
            type: 'real',
            default: 0,
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
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
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['mission_id'],
            referencedTableName: 'mission',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['participant_id'],
            referencedTableName: TableDB.USER,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['sender_id'],
            referencedTableName: TableDB.USER,
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          }),
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const reportTable = await queryRunner.getTable(TableDB.REPORT);
    const missionByForeignKey = reportTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('mission_id') !== -1
    );
    const participantForeignKey = reportTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('participant_id') !== -1
    );
    const senderForeignKey = reportTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('sender_id') !== -1
    );
    await queryRunner.dropForeignKeys(TableDB.MISSION, [
      missionByForeignKey,
      participantForeignKey,
      senderForeignKey,
    ]);

    await queryRunner.dropTable(TableDB.REPORT);
  }
}
