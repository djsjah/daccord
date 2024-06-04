import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  UpdatedAt,
  BelongsToMany
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';
import UserContactModel from './user.contact.model';
import SubscriptionModel from '../subscription/subscription.model';
import PostModel from '../post/post.model';

@Table
class UserModel extends Model {
  @ApiProperty({
    description: 'User id',
    example: '123e4567-e89b-12d3-a456-426614174000',
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

  @ApiProperty({ description: 'User name', example: 'dany_35', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;

  @ApiProperty({ description: 'User role', example: 'admin', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  role!: string;

  @ApiProperty({ description: 'User email', example: 'st1035@mail.ru', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  email!: string;

  @ApiProperty({ description: 'User password', example: 'kjelkJls822??!!', type: String })
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @ApiProperty({ description: 'User creation date', example: new Date(), type: Date })
  @Column({
    type: DataType.DATE,
    defaultValue: new Date(),
    allowNull: false
  })
  createdAt!: Date;

  @ApiProperty({ description: 'User modification date', example: new Date(), type: Date })
  @UpdatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  updatedAt!: Date;

  @ApiProperty({ description: 'User rating', example: 0, type: Number })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    allowNull: false
  })
  rating!: number;

  @ApiProperty({ description: 'User posts', type: () => [PostModel] })
  @HasMany(() => PostModel)
  posts!: PostModel[];

  @ApiProperty({ description: 'User contacts', type: () => [UserContactModel] })
  @HasMany(() => UserContactModel)
  contacts!: UserContactModel[];

  @ApiProperty({ description: 'User subscriber', type: () => [UserModel] })
  @BelongsToMany(() => UserModel, {
    through: () => SubscriptionModel,
    foreignKey: 'subscriberId',
    otherKey: 'userId'
  })
  subscribers!: UserModel[];
}
export default UserModel;
