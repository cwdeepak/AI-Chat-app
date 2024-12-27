import { useEffect, useRef, useState } from 'react';
import './App.css';
import RecentSearch from './components/RecentSearch';
import QuestionAnswer from './components/QuestionAnswer';
import { MdDarkMode, MdLightMode, MdSend, MdMenu, MdClose } from 'react-icons/md';
import { API_URL, MODEL, MAX_TOKENS } from './constants';

// Main App component for the AI Chat Assistant
// This component manages the overall state and UI of the chat application
function App() {
	// State for the current question input by the user
	const [question, setQuestion] = useState('');
	// State for storing the conversation history (questions and answers)
	const [result, setResult] = useState([]);
	// State for error messages
	const [error, setError] = useState('');
	// State for recent search history loaded from localStorage
	const [recentHistory, setRecentHistory] = useState(JSON.parse(localStorage.getItem('history')));
	// State for selected history item to re-query
	const [selectedHistory, setSelectedHistory] = useState('');
	// Ref for scrolling to the bottom of the chat
	const scrollResult = useRef();
	// State for loading indicator during API calls
	const [loading, setLoading] = useState(false);

	// State for dark mode theme, initialized from localStorage or system preference
	const [darkMode, setDarkMode] = useState(() => {
		try {
			const stored = localStorage.getItem('theme');
			if (stored) return stored;
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
			return 'light';
		} catch {
			return 'dark';
		}
	});

	// useEffect to apply dark mode class to document and save to localStorage
	useEffect(() => {
		try {
			if (darkMode === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			localStorage.setItem('theme', darkMode);
		} catch {
			// ignore
		}
	}, [darkMode]);

	// State for sidebar open/close on mobile
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// useEffect to scroll to bottom when result updates
	useEffect(() => {
		if (scrollResult.current) {
			scrollResult.current.scrollTo({
				top: scrollResult.current.scrollHeight,
				behavior: 'smooth'
			});
		}
	}, [result]);

	// Function to get answer from AI API
	const getAnswer = async () => {
		// Check if there's a question or selected history to process
		if (!question && !selectedHistory) return;

		// If there's a new question, update the history in localStorage
		if (question) {
			if (localStorage.getItem('history')) {
				let history = JSON.parse(localStorage.getItem('history'));
				// Add new question to history
				history = [...history, question];
				// Capitalize first letter and trim
				history = history.map(item => item.charAt(0).toUpperCase() + item.slice(1).trim());
				// Remove duplicates
				history = [...new Set(history)];
				localStorage.setItem('history', JSON.stringify(history));
				setRecentHistory(history);
			} else {
				// Initialize history if none exists
				localStorage.setItem('history', JSON.stringify([question]));
				setRecentHistory([question]);
			}
		}

		// Prepare payload for API call
		const payloadData = question ? question : selectedHistory;
		const payload = {
			model: MODEL,
			messages: [
				{
					role: 'user',
					content: payloadData
				}
			],
			max_tokens: MAX_TOKENS
		};
		setLoading(true);

		try {
			// Make API call to Groq
			let res = await fetch(API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
				},
				body: JSON.stringify(payload)
			});
			const data = await res.json();
			let stringData = data?.choices[0]?.message.content;

			// Update result with new question and answer
			setResult([
				...result,
				{ type: 'q', text: question ? question : selectedHistory },
				{ type: 'a', text: stringData }
			]);
			setQuestion('');
		} catch (err) {
			setError('Failed to get answer. Check your connection or API key.');
		} finally {
			setLoading(false);
		}
	};

	// Function to handle Enter key press for sending message
	const isEnter = e => {
		if (e.key === 'Enter') {
			getAnswer();
		}
	};

	// useEffect to trigger getAnswer when selectedHistory changes
	useEffect(() => {
		getAnswer();
	}, [selectedHistory]);

	// Main JSX return for the App component
	return (
		<main
			className={`min-h-screen ${darkMode === 'dark' ? 'bg-neutral-900 text-neutral-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}
		>
			<div className="flex h-screen">
				{/* Sidebar: responsive. Hidden on small screens unless toggled */}
				{sidebarOpen && (
					<div
						className="fixed inset-0 bg-black/30 z-40 sm:hidden"
						onClick={() => setSidebarOpen(false)}
						aria-hidden="true"
					/>
				)}
				<div className={`${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-full sm:w-80' : 'hidden sm:block sm:w-80'}`}>
					<div className="h-full bg-gray-50 dark:bg-neutral-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
						<div className="p-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
							<h1 className="text-xl font-bold">AI Chat Assistant</h1>
							<button
								className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
								onClick={() => setSidebarOpen(false)}
								aria-label="Close menu"
							>
								<MdClose />
							</button>
						</div>
						{/* Recent Searches Component */}
						<RecentSearch
							recentHistory={recentHistory}
							setRecentHistory={setRecentHistory}
							setSelectedHistory={setSelectedHistory}
						/>
						{/* Theme Toggle */}
						<div className="p-4 border-t border-gray-300 dark:border-gray-700">
							<button
								onClick={() => setDarkMode(darkMode === 'dark' ? 'light' : 'dark')}
								className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
								aria-label="Toggle theme"
							>
								{darkMode === 'dark' ? (
									<MdLightMode className="text-yellow-500" />
								) : (
									<MdDarkMode className="text-gray-600" />
								)}
								<span>{darkMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
							</button>
						</div>
					</div>
				</div>

				{/* Chat Area */}
				<div className="flex-1 flex flex-col pb-28 relative">
					{/* Mobile top bar */}
					<div className="sm:hidden p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
						<button
							onClick={() => setSidebarOpen(true)}
							aria-label="Open menu"
							className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800"
						>
							<MdMenu size={24} />
						</button>
						<h2 className="text-lg font-semibold">Chat</h2>
						<div className="w-8" />
					</div>
					{/* Chat messages container */}
					<div className="flex-1 p-4 overflow-hidden bg-gray-50 dark:bg-neutral-900">
						<div className="h-full flex flex-col">
							<div ref={scrollResult} className="flex-1 overflow-auto p-4 space-y-4">
								{/* Render question-answer pairs */}
								<QuestionAnswer result={result} />
								{/* Loading spinner */}
								{loading && (
									<div className="flex justify-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 dark:border-slate-500"></div>
									</div>
								)}
								{/* Error message */}
								{error && (
									<div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded">
										Error: {error.message || 'Something went wrong'}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Input Island: centered & constrained inside chat column */}
					<div className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 mx-auto w-full sm:max-w-2xl px-4 z-40">
						<div className="bg-white/95 dark:bg-black/80 border border-gray-100/70 dark:border-gray-800 rounded-full shadow-2xl dark:shadow-black/60 p-3 flex items-center gap-3">
							{/* Input field for user question */}
							<input
								type="text"
								className="flex-1 px-4 py-3 rounded-full bg-transparent text-gray-900 dark:text-neutral-100 placeholder-gray-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
								placeholder="Ask me anything..."
								onKeyDown={isEnter}
								onChange={e => setQuestion(e.target.value)}
								value={question}
							/>
							{/* Send button */}
							<button
								onClick={getAnswer}
								className="p-3 bg-blue-500 dark:bg-neutral-800 hover:bg-blue-600 dark:hover:bg-neutral-700 text-white rounded-full shadow-md transition-colors flex items-center justify-center"
								aria-label="Send message"
							>
								<MdSend />
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}

export default App;
