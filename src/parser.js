const parse = (data) => {
  const xmlData = new DOMParser().parseFromString(data, 'text/xml');

  const parsererrorTag = xmlData.querySelector('parsererror');
  if (parsererrorTag !== null) {
    const err = new Error('parser');
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
    const itemLinkTag = itemTag.querySelector('link');
    const itemLink = itemLinkTag.textContent;
    const itemTitleTag = itemTag.querySelector('title');
    const itemTitle = itemTitleTag.textContent;
    return { link: itemLink, title: itemTitle };
  });

  const channel = {
    title,
    description,
    items,
  };

  return { channel };
};

export default parse;
