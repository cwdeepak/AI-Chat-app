import React from 'react';
import { MdDelete } from 'react-icons/md';

// Component to display and manage recent search history
const RecentSearch = ({ recentHistory, setRecentHistory, setSelectedHistory }) => {
	// Function to clear all history
	const clearHistory = () => {
		localStorage.clear();
		setRecentHistory([]);
	};

	// Function to clear a specific history item
	const clearSelectedHistory = selectedItem => {
		let history = JSON.parse(localStorage.getItem('history'));
		history = history.filter(historyItem => {
			if (historyItem != selectedItem) {
				return historyItem;
			}
		});
		localStorage.setItem('history', JSON.stringify(history));
		setRecentHistory(history);
	};

	return (
		<div className="flex-1 flex flex-col">
			{/* Header with title and clear all button */}
			<div className="p-4 border-b border-gray-200 dark:border-gray-800">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold">Recent Searches</h2>
					<button
						onClick={clearHistory}
						className="text-gray-600 dark:text-neutral-300 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
						aria-label="Clear all history"
					>
						<MdDelete size={20} />
					</button>
				</div>
			</div>
			{/* List of recent searches */}
			<ul className="flex-1 overflow-auto p-2 space-y-2">
				{recentHistory &&
					recentHistory.map((historyItem, id) => (
						<li
							key={id}
							className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer group"
						>
							{/* Clickable text to select history item */}
							<span className="flex-1 truncate text-sm" onClick={() => setSelectedHistory(historyItem)}>
								{historyItem}
							</span>
							{/* Delete button for individual item */}
							<button
								onClick={() => clearSelectedHistory(historyItem)}
								className="opacity-60 hover:opacity-100 text-gray-500 dark:text-neutral-300 hover:text-red-500 transition-opacity p-1 rounded-md"
								aria-label="Delete this search"
							>
								<MdDelete size={16} />
							</button>
						</li>
					))}
			</ul>
		</div>
	);
};

export default React.memo(RecentSearch);
