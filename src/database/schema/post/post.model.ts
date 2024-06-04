import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  UpdatedAt
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import UserModel from '../user/user.model';

@Table
class PostModel extends Model {
  @ApiProperty({
    description: 'Post id',
    example: '233e9604-e89b-12d3-a456-7869939201111',
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

  @ApiProperty({ description: 'Post title', example: 'Мое хобби', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  title!: string;

  @ApiProperty({ description: 'Post creation date', example: new Date(), type: Date })
  @Column({
    type: DataType.DATE,
    defaultValue: new Date(),
    allowNull: false
  })
  createdAt!: Date;

  @ApiProperty({ description: 'Post modification date', example: new Date(), type: Date })
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Post text',
    example: 'Сегодня я хочу рассказать о своем хобби...',
    type: String
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  content!: string;

  @ApiProperty({ description: 'Post rating', example: 12, type: Number })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  rating!: number;

  @ApiProperty({
    description: 'Post tags',
    example: ['жизнь', 'хобби'],
    type: [String],
    required: false
  })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true
  })
  tags?: string[] | null | undefined;

  @ApiProperty({
    description: 'Author id of the current post',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.UUID
  })
  authorId!: string;

  @ApiProperty({ description: 'Author of the current post', type: () => UserModel })
  @BelongsTo(() => UserModel)
  author!: UserModel;
}
export default PostModel;
