import React from 'react';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const Answer = ({ rawText }) => {
	const components = {
		code({ inline, className, children, ...props }) {
			const match = /language-(\w+)/.exec(className || '');
			return !inline && match ? (
				<SyntaxHighlighter
					{...props}
					children={String(children).replace(/\n$/, ' ')}
					language={match[1]}
					style={dark}
					PreTag="div"
				/>
			) : (
				<code {...props} className={className}>
					{children}
				</code>
			);
		}
	};

	return (
		<div>
			<ReactMarkdown components={components}>{rawText}</ReactMarkdown>
		</div>
	);
};

export default React.memo(Answer);
