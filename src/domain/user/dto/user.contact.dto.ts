import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

class UserContactDTO {
  @ApiProperty({ description: 'User contact type', example: 'phone', type: String })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'User contact value', example: '+7 982 408 31 75', type: String })
  @IsString()
  @IsNotEmpty()
  value: string;
}
export default UserContactDTO;
