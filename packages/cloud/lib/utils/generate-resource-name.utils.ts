import { CommonProps } from '../types/interfaces/common-props';

const generateResourceName = (name: string, props: CommonProps): string =>
  `${props.envName}-${name}`;

export default generateResourceName;
