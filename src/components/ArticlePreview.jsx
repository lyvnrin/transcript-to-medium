function ArticlePreview({ article }) {
  return (
    <article className="article-preview">
      <h1 className="article-title">{article.title}</h1>
      {article.subtitle && <p className="article-subtitle">{article.subtitle}</p>}
      {article.content.map((block, index) =>
        block.type === 'heading' ? (
          <h2 key={index} className="article-heading">
            {block.text}
          </h2>
        ) : (
          <p key={index} className="article-paragraph">
            {block.text}
          </p>
        ),
      )}
    </article>
  )
}

export default ArticlePreview
