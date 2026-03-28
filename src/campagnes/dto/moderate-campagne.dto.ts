import { IsIn, IsNotEmpty } from 'class-validator';
import { StatutCampagne } from '../domain/statut-campagne';

export class ModerateCampagneDto {
    @IsNotEmpty()
    @IsIn([StatutCampagne.ACTIVE, StatutCampagne.REFUSEE], {
        message: 'Le statut doit être ACTIVE (acceptée) ou REFUSEE',
    })
    statut: StatutCampagne;
}