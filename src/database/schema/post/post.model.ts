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
    defaultValue: () => uuid(),
    unique: true,
    allowNull: false
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  access!: string;

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
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  rating!: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true
  })
  tags?: string[] | null | undefined;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  authorId!: string;

  @BelongsTo(() => User)
  author!: User;
}
export default Post;
