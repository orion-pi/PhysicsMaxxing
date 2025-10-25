import { remark } from 'remark';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

export default async function Markdown({content}: {content: string}) {
    const file = await remark()
    .use(remarkMath)         // parse math in Markdown
    .use(remarkRehype)       // convert Markdown AST → HTML AST
    .use(rehypeKatex)        // render LaTeX to HTML using KaTeX
    .use(rehypeStringify)    // stringify HTML AST → HTML text
    .process(content);
    const html = String(file);
    // Ensure we pass a plain string (not a VFile object) to the client
    return (
        <div dangerouslySetInnerHTML={{ __html: html }} />
    );
}