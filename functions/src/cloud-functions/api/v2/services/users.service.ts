import { IUser } from '@/types/user';
import { readUser } from '@/lib/postgres/users';
import { HttpException } from '../../common/exceptions/HttpException';

export class UserService {
  public async getUserById(userId: string) {
    const result = await readUser(userId);

    if (result.rowCount === 0) {
      throw new HttpException(400, 'user does not exist');
    }

    return result.rows[0];
  }

  public async createUser(userData: IUser) {
    return null;
  }

  public async updateUser(userId: string, data: IUser) {
    return null;
  }

  public async deleteUser(userId: string) {
    return null;
  }
}
