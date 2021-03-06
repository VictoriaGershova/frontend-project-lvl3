import * as yup from 'yup';

const baseSchema = yup.string().required().url();

const validate = (link, channels) => {
  const existedLinks = channels.map(({ link: channelLink }) => channelLink);
  return baseSchema.notOneOf(existedLinks).validate(link, { abortEarly: false });
};

export default validate;
