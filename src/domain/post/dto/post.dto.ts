import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

class PostDTO {
  @ApiProperty({ description: 'Post title', example: 'Выходные на природе!', type: String })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Post content',
    example: 'Недавно я решил выбраться на природу...',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Post rating', example: 12, type: Number, required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({
    description: 'Post tags',
    example: ['природа', 'выходные'],
    type: [String],
    required: false
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Author id of the post',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
export default PostDTO;
