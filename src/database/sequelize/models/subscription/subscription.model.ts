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
    unique: true,
    allowNull: false,
    defaultValue: () => uuid()
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

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  userName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  subscriberName!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  subscriberId!: string;
}
export default Subscription;
