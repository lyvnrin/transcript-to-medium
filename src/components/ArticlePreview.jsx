function ArticlePreview({ html }) {
  return <article className="article-preview" dangerouslySetInnerHTML={{ __html: html }} />
}

export default ArticlePreview
