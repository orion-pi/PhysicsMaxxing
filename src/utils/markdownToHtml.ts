import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

export default async function renderMarkdown(content: string) {
  const file = await remark()
    .use(remarkMath)         // parse math in Markdown
    .use(remarkRehype)       // convert Markdown AST → HTML AST
    .use(rehypeKatex)        // render LaTeX to HTML using KaTeX
    .use(rehypeStringify)    // stringify HTML AST → HTML text
    .process(content);

  return String(file);
}
