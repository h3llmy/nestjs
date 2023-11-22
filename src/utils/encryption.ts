import * as bcrypt from 'bcrypt';

class Encript {
  public static hash = (password: string) => {
    return bcrypt.hashSync(password, 10);
  };
  public static compare = (
    enteredPassword: string,
    currentPassword: string,
  ) => {
    return bcrypt.compareSync(enteredPassword, currentPassword);
  };
}

export default Encript;
