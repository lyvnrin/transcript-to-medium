import { forwardRef } from 'react'

const ArticlePreview = forwardRef(function ArticlePreview({ html }, ref) {
  return <article ref={ref} className="article-preview" dangerouslySetInnerHTML={{ __html: html }} />
})

export default ArticlePreview
