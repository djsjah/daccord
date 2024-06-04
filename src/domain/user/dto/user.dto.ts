import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import UserContactDTO from './user.contact.dto';

class UserDTO {
  @ApiProperty({ description: 'User name', example: 'bogdan_10', type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User role', example: 'admin', type: String })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'User email', example: 'voyagerbvb@gmail.com', type: String })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'jkndjiHhhsd122?!', type: String })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'User rating', example: '44', type: Number, required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ description: 'User contacts', type: [UserContactDTO], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserContactDTO)
  @IsOptional()
  contacts?: UserContactDTO[];
}
export default UserDTO;
