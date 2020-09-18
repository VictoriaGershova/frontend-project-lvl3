const parseRSS = (data) => {
  const xmlData = new DOMParser().parseFromString(data, 'text/xml');

  const parsererrorTag = xmlData.querySelector('parsererror');
  if (parsererrorTag !== null) {
    const err = new Error();
    err.name = 'ParserError';
    throw err;
  }

  const channelTag = xmlData.querySelector('channel');
  const titleTag = channelTag.querySelector('title');
  const title = titleTag.textContent;
  const descriptionTag = channelTag.querySelector('description');
  const description = descriptionTag.textContent;

  const itemTags = xmlData.querySelectorAll('item');
  const items = [...itemTags].map((itemTag) => {
    const linkTag = itemTag.querySelector('link');
    const link = linkTag.textContent;
    const titleTag = itemTag.querySelector('title');
    const title = titleTag.textContent;
    const item = { link, title };
    return item;
  });

  const channel = {
    title,
    description,
    items,
  };

  return { channel };
};

export default parseRSS;
