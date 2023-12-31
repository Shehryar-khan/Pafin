export enum RESPONSE_MESSAGE {
  USER_REGISTERED = 'User Registered Successfully',
  USER_LOGIN = 'User loggedIn Successfully',
  EMAIL_ALREADY_REGISTERED = 'Email Already registered',
  INCORRECT_PASSWORD = 'Incorrect Password',
  USER_NOT_FOUND = 'User Not Found',
  NOT_ALLOWED_TO_EDIT = 'Update not possible',
  USER_UPDATED = 'User updated',
  NO_DATA_TO_UPDATE = 'No Data To Update',
  NOT_ALLOWED_TO_DELETE = 'Not allowed to delete',
  USER_DELETED = 'User Deleted',
  MIN_CHARACTERS = 'Name must have atleast 2 characters',
  INVALID_EMAIL = 'Invalid Email',
  PASSWORD_ERRORS = `
  Password must contain Minimum 8 and maximum 20 characters, 
  at least one uppercase letter, 
  one lowercase letter, 
  one number and 
  one special character`,
}
