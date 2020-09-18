import { uniqueId } from 'lodash';

export default (props) => {
  const id = uniqueId();
  const newEntity = { ...props, id };
  return newEntity;
};
