import { forwardRef, useMemo } from 'react'

const ArticlePreview = forwardRef(function ArticlePreview({ html }, ref) {
  const markup = useMemo(() => ({ __html: html }), [html])
  return <article ref={ref} className="article-preview" dangerouslySetInnerHTML={markup} />
})

export default ArticlePreview
