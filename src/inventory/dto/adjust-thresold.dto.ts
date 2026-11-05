import { IsInt, IsNotEmpty, Max, Min, ValidateIf } from 'class-validator';

export class AdjustThresholdDto {
  @ValidateIf((o) => o.newThreshold !== null)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  newThreshold!: number | null;
}
