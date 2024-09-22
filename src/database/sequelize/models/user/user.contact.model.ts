import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { v4 as uuid } from 'uuid';
import User from './user.model';

@Table
class UserContact extends Model {
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
    type: DataType.STRING,
    unique: true,
    allowNull: false
  })
  value!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;
}
export default UserContact;
