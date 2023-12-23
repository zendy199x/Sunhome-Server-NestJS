import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TableDB } from '../../commons/enums/table-db.enum';

export class MissionParticipantsMigration1703305632600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.MISSION_PARTICIPANTS,
        columns: [
          {
            name: 'mission_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['mission_id'],
            referencedColumnNames: ['id'],
            referencedTableName: TableDB.MISSION,
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['user_id'],
            referencedColumnNames: ['id'],
            referencedTableName: TableDB.USER,
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'PK_mission_participants',
            columnNames: ['mission_id', 'user_id'],
            isUnique: true,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TableDB.MISSION_PARTICIPANTS);
  }
}
