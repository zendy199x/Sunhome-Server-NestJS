import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';
import { TableDB } from '../../commons/enums/table-db.enum';
import { UserRole } from '../../commons/enums/user-role.enum';

export class UserMigration1703175817991 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TableDB.USER,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: `uuid_generate_v4()`,
          },
          {
            name: 'username',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'enum',
            enum: Object.values(UserRole),
            enumName: 'user_role_enum',
            default: `'${UserRole.MEMBER}'`,
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
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'avatar_id',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      TableDB.USER,
      new TableForeignKey({
        columnNames: ['avatar_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableDB.FILE,
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createIndex(
      TableDB.USER,
      new TableIndex({
        name: 'username_idx',
        columnNames: ['username'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(TableDB.USER);
    const avatarForeignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('avatar_id') !== -1
    );
    await queryRunner.dropForeignKeys(TableDB.USER, [avatarForeignKey]);
    await queryRunner.dropIndex(TableDB.USER, 'username_idx');
    await queryRunner.dropTable(TableDB.USER);
  }
}
