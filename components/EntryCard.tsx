const EntryCard = ({ entry }) => {
	const date = new Date(entry.createdAt).toDateString();
	return (
		<div className="bg-white shadow rounded-lg overflow-hidden divide-gray-200 divide-y">
			<div className="px-4 py-5">{date}</div>
			<div className="px-4 py-5">summary</div>
			<div className="px-4 py-5">mood</div>
		</div>
	);
};

export default EntryCard;
