export async function getGitHubLanguages(username: string): Promise<string[]> {
	const languagesSet = new Set<string>();
	let page = 1;
	let hasMore = true;

	try {
		while (hasMore) {
			const response = await fetch(
				`https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
				{
					headers: {
						Accept: 'application/vnd.github+json',
					},
				}
			);

			if (!response.ok) {
				console.error(`GitHub API error: ${response.status}`);
				break;
			}

			const repos = await response.json();
			if (repos.length === 0) {
				hasMore = false;
				break;
			}

			repos.forEach((repo) => {
				if (repo.language) {
					languagesSet.add(repo.language);
				}
			});

			page++;
		}
	} catch (error) {
		console.error('Error fetching GitHub languages:', error);
	}

	return Array.from(languagesSet);
}
