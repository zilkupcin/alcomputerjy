export const fetchAllArticles = async page => {
  return await fetch(
    `http://hajjar.tech/wp-json/wp/v2/posts?per_page=10&page=${page}`
  );
};

export const fetchArticlesByTag = async (page, tagId) => {
  return await fetch(
    `http://hajjar.tech/wp-json/wp/v2/posts?per_page=10&page=${page}&tags=${tagId}`
  );
};

export const fetchArticlesByCategory = async (page, categoryId) => {
  const url = `http://hajjar.tech/wp-json/wp/v2/posts?per_page=10&page=${page}&categories=${categoryId}`;

  return await fetch(
    `http://hajjar.tech/wp-json/wp/v2/posts?per_page=10&page=${page}&categories=${categoryId}`
  );
};

export const fetchArticleImages = async articles => {
  
  const articlesWithImages = articles.filter(article => {
    return article._links["wp:featuredmedia"] && article._links["wp:featuredmedia"][0] && article._links["wp:featuredmedia"][0].href;
  });

  const imageResponses = await Promise.all(    
    articlesWithImages.map(article => {
      return fetch(article._links["wp:featuredmedia"][0].href);
    })
  );

  const imageJson = await Promise.all(
    imageResponses.map(imageResponse => {
      return imageResponse.json();
    })
  );

  const imageUrls = imageJson.map(json => {
    return json.media_details.sizes.medium_large.source_url;
  });

  for (let i = 0; i < articlesWithImages.length; i++) {
    articlesWithImages[i].featured_media = imageUrls[i];
  }

  articles.forEach(article => {
    articlesWithImages.forEach(articleWithImage => {
      if (article.id === articleWithImage.id){
        article.featured_media = articleWithImage.featured_media;
      }
    })
  })

  return articles;
};

export const fetchArticleCategory = async id => {
  const response = await fetch(
    `http://hajjar.tech/wp-json/wp/v2/categories?post=${id}`
  );
  return await response.json();
};

export const fetchArticleTags = async id => {
  const response = await fetch(
    `http://hajjar.tech/wp-json/wp/v2/tags?post=${id}`
  );
  return await response.json();
};
