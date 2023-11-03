import { getItem } from '@/lib/services/dynamo';
import { HttpException } from '../../common/exceptions/HttpException';
import { GenericObject } from '@/types/global';
import { FirestoreAPI } from '@/lib/firestore';
import { logError } from '@/lib/utils/log';

const { fedOfficials } = new FirestoreAPI().models;

export class FedOfficialsService {
  public async getById(id: string) {
    try {
      const result = await getItem({
        table: 'fedOfficials',
        keys: { id },
      });

      // const result = await fedOfficials.get(id)

      if (!result) {
        throw new HttpException(400, `fed official ${id} does not exist`);
      }

      return result as GenericObject;
    } catch (error) {
      throw new HttpException(500, 'Error retrieving fed official');
    }
  }

  public async dynamoToFirestore(id: string) {
    try {
      const dynamoRecord = await this.getById(id);
      return fedOfficials.create(dynamoRecord);
    } catch (error) {
      logError(error);
      throw new HttpException(500, 'Error migrating fed official');
    }
  }
}
