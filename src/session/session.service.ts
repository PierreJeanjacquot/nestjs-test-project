import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { Challenge, ChallengeDocument } from '../schema/challenge.schema';
import { TypedDataChallenge } from './entities/session.entity';
import { utils as ethersUtils } from 'ethers';

const getChallengeText = (value: string): string =>
  `Sign this message to login: ${value}`;

const getEIP712 = (challengeValue: string): TypedDataChallenge => ({
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
    ],
    Challenge: [{ name: 'challenge', type: 'string' }],
  },
  domain: {
    name: 'nest project',
    version: '1',
  },
  primaryType: 'Challenge',
  message: {
    challenge: challengeValue,
  },
});

const hashEIP712 = (typedData: TypedDataChallenge) => {
  const { domain, message } = typedData;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { EIP712Domain, ...types } = typedData.types;
  return ethersUtils._TypedDataEncoder.hash(domain, types, message);
};

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Challenge.name)
    private challengeModel: Model<ChallengeDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getChallenge(address: string): Promise<TypedDataChallenge> {
    const current = await this.challengeModel.findOne({ address });
    if (current) {
      const challengeText = getChallengeText(current.value);
      const typedData = getEIP712(challengeText);
      return typedData;
    }
    const value = ethersUtils.hexlify(ethersUtils.randomBytes(16));
    const challengeText = getChallengeText(value);
    const typedData = getEIP712(challengeText);
    const hash = hashEIP712(typedData);
    const challenge = new this.challengeModel({
      address,
      hash,
      value,
    });
    await challenge.save();
    return typedData;
  }

  async checkUserAuthorization(authorization: string): Promise<string | null> {
    try {
      const authArray = authorization?.split('_');
      const hash = authArray[0];
      const signature = authArray[1];
      const address = authArray[2]; // validate

      const currentChallenge = await this.challengeModel.findOne({
        hash,
        address,
      });
      if (!currentChallenge || !currentChallenge.value) {
        throw Error('Challenge not valid. Need to request a new challenge.');
      }
      const typedData = getEIP712(getChallengeText(currentChallenge.value));
      const { domain, message } = typedData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { EIP712Domain, ...types } = typedData.types;
      let signerAddress;
      try {
        signerAddress = ethersUtils.verifyTypedData(
          domain,
          types,
          message,
          signature,
        );
      } catch (e) {
        throw Error('Failed to verify signature');
      }
      if (signerAddress.toLowerCase() !== address.toLowerCase())
        throw Error('Failed to verify signer, addresses mismatch.');
      await currentChallenge.remove();
      const userAddress = currentChallenge.address;

      // create user if not exists
      const currentUser = await this.userModel.findOne({
        address: userAddress,
      });
      if (!currentUser) {
        const newUser = new this.userModel({ address: userAddress });
        await newUser.save();
      }
      return userAddress;
    } catch (e) {
      // todo log
      return null;
    }
  }
}
