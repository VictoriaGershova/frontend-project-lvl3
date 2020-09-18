import make from '../AppEntity';

export default ({ link, title, description, channel }) => {
  const newPost = make({ link, title, description, channel });
  return newPost;
};
