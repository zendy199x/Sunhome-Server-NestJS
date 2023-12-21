export const ValidatorConstants = {
  NOT_FOUND: (name: string) => {
    return `${name} doesn't exist`;
  },
  EXIST: (name: string) => {
    return `${name} already exist`;
  },
};
