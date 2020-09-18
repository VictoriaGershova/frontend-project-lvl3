import make from '../AppEntity';

export default ({ link, title, description }) => {
  const newChannel = make({ link, title, description });
  return newChannel;
};
