import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  UpdatedAt,
  BelongsToMany
} from 'sequelize-typescript';
import { v4 as uuid } from 'uuid';
import UserContact from './user.contact.model';
import Post from '../post/post.model';
import Subscription from '../subscription/subscription.model';

@Table
class User extends Model {
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
    unique: true,
    allowNull: false
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  role!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false
  })
  isActivated!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  refreshToken!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  verifToken!: string | null;

  @Column({
    type: DataType.DATE,
    defaultValue: new Date(),
    allowNull: false
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  updatedAt!: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  rating!: number;

  @HasMany(() => Post)
  posts!: Post[];

  @HasMany(() => UserContact)
  contacts!: UserContact[];

  @BelongsToMany(() => User, {
    through: () => Subscription,
    foreignKey: 'userId',
    otherKey: 'subscriberId'
  })
  subscribers!: Subscription[];
}
export default User;
