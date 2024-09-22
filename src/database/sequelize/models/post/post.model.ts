import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  UpdatedAt
} from 'sequelize-typescript';
import { v4 as uuid } from 'uuid';
import User from '../user/user.model';

@Table
class Post extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    unique: true,
    allowNull: false,
    defaultValue: () => uuid()
  })
  id!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true
  })
  revisionGroupId?: string | null | undefined;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  isMainRevision!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: new Date()
  })
  createdAt!: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  updatedAt!: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  authorId!: string;

  @BelongsTo(() => User)
  author!: User;
}
export default Post;
