import SyntaxHighlighter from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { MdPerson, MdSmartToy } from 'react-icons/md';

// Component to render the list of questions and answers in the chat
const QuestionAnswer = ({ result }) => {
	// Custom renderer for markdown, with syntax highlighting for code blocks
	const renderer = {
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
		<div className="space-y-4">
			{/* Map over result array to render each question or answer */}
			{result.map((item, index) => {
				if (item.type === 'q') {
					// Render user question on the right
					return (
						<div key={`q-${index}`} className="flex justify-end px-2">
							<div className="flex items-start gap-2 max-w-full sm:max-w-md md:max-w-lg">
								<div className="bg-blue-500 dark:bg-neutral-800 text-white p-3 rounded-lg rounded-br-none shadow-sm dark:shadow-none border border-transparent sm:border-gray-100 dark:border-transparent">
									{item.text}
								</div>
								<div className="w-8 h-8 bg-blue-500 dark:bg-neutral-800 rounded-full flex items-center justify-center">
									<MdPerson className="text-white" size={16} />
								</div>
							</div>
						</div>
					);
				} else {
					// Render AI answer on the left with markdown support
					return (
						<div key={`a-${index}`} className="flex justify-start px-2">
							<div className="flex items-start gap-2 max-w-full sm:max-w-2xl md:max-w-3xl">
								<div className="w-8 h-8 bg-gray-500 dark:bg-neutral-700 rounded-full flex items-center justify-center">
									<MdSmartToy className="text-white" size={16} />
								</div>
								<div className="bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-neutral-100 p-3 rounded-lg rounded-bl-none shadow-sm dark:shadow-none border border-transparent sm:border-gray-100 dark:border-transparent">
									<ReactMarkdown components={renderer}>{item.text}</ReactMarkdown>
								</div>
							</div>
						</div>
					);
				}
			})}
		</div>
	);
};

export default QuestionAnswer;
