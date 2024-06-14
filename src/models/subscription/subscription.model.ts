import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey
} from 'sequelize-typescript';
import { v4 as uuid } from 'uuid';
import User from '../user/user.model';

@Table
class Subscription extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: () => uuid(),
    unique: true,
    allowNull: false
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  type!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  period?: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  userId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  subscriberId!: string;
}
export default Subscription;
