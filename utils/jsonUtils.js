export const parseArticles = jsonData => {
  const articles = jsonData.map(article => {
    let excerpt = article.excerpt.rendered;
    excerpt = excerpt.replace("<p>", "");
    excerpt = excerpt.replace("</p>", "");
    excerpt = excerpt.substring(0, 80);
    excerpt = excerpt + "...";
    excerpt = `<p>${excerpt}</p>`;

    let content = article.content.rendered;
    let hasVideo = article.content.rendered.includes('iframe');

    // If featured media is anything but a url, set the url to blank
    if (article.featured_media === undefined || !article.featured_media.toString().includes('hajjar.tech')){
      article.featured_media = '';
    }
    
    return {
      id: article.id,
      date: article.date,
      title: article.title.rendered,
      content: content,
      excerpt: excerpt,
      image: article.featured_media,
      hasVideo: hasVideo
    };
  });

  return articles;
};

export const parseArticleCategory = jsonData => {
  return { id: jsonData[0].id, name: jsonData[0].name };
};

export const parseArticleTags = jsonData => {
  return jsonData.map(tag => {
    return {
      id: tag.id,
      name: tag.name
    };
  });
};
