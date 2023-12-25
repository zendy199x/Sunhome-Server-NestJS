import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';
import { TableDB } from '../../commons/enums/table-db.enum';

export class AddReportOrderAndReportIdToFileMigration1703437977091 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(TableDB.FILE, [
      new TableColumn({
        name: 'report_id',
        type: 'uuid',
        isNullable: true,
      }),
      new TableColumn({
        name: 'report_file_order',
        type: 'int',
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKey(
      TableDB.FILE,
      new TableForeignKey({
        columnNames: ['report_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.REPORT,
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const fileTable = await queryRunner.getTable(TableDB.FILE);
    const reportByForeignKey = fileTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('report_id') !== -1
    );
    await queryRunner.dropForeignKeys(TableDB.FILE, [reportByForeignKey]);
    await queryRunner.dropColumns(TableDB.FILE, ['report_id', 'report_file_order']);
  }
}
