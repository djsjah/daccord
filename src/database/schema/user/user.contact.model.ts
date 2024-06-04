import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import UserModel from './user.model';

@Table
class UserContactModel extends Model {
  @ApiProperty({
    description: 'User contact id',
    example: '6869e4666-e89b-12d3-a456-426617839001',
    type: String
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: () => uuid(),
    unique: true,
    allowNull: false
  })
  id!: string;

  @ApiProperty({ description: 'User contact type', example: 'email', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  type!: string;

  @ApiProperty({ description: 'User contact value', example: 'bestmail@mail.ru', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  value!: string;

  @ApiProperty({
    description: 'User id of this contact',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @ApiProperty({ description: 'User of this contact', type: () => UserModel })
  @BelongsTo(() => UserModel)
  user!: UserModel;
}
export default UserContactModel;
