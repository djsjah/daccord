import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import UserModel from '../user/user.model';

@Table
class SubscriptionModel extends Model {
  @ApiProperty({
    description: 'Subscription id',
    example: '894e7849-e89b-55d3-a988-8880280134',
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

  @ApiProperty({ description: 'Subscription type', example: 'bypass+', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  type!: string;

  @ApiProperty({ description: 'Subscription period', example: new Date(2025, 0, 1), type: Date })
  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  period?: Date;

  @ApiProperty({
    description: 'User id they are following',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID
  })
  userId!: string;

  @ApiProperty({
    description: 'Subscriber id',
    example: '455e4567-e89b-12d3-a456-789393900055',
    type: String
  })
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID
  })
  subscriberId!: string;
}
export default SubscriptionModel;
