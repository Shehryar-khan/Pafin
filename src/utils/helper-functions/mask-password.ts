export const maskPassword = (value: string) => {
  let maskedValue = '';
  for (let i = 0; i < value.length; i++) {
    maskedValue += '*';
  }
  return maskedValue;
};
