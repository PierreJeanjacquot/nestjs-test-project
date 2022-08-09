import { utils } from 'ethers';

export const addressValidator = {
  validator: (address: string) => {
    try {
      utils.getAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  },
  message: '{PATH} is not a valid address',
};
