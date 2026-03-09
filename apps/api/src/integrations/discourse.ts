async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Discourse ${res.status}: ${url}`);
  return res.json();
}

export const discourseClient = {
  async getPosts(forumUrl: string, category?: string) {
    try {
      const url = category
        ? `${forumUrl}/c/${category}.json`
        : `${forumUrl}/latest.json`;
      const data = await fetchJson(url);
      return (
        data.topic_list?.topics?.slice(0, 15).map((t: any) => ({
          id: t.id,
          title: t.title,
          created_at: t.created_at,
          posts_count: t.posts_count,
          views: t.views,
          like_count: t.like_count,
        })) || []
      );
    } catch {
      return [];
    }
  },

  async search(forumUrl: string, query: string) {
    try {
      const data = await fetchJson(`${forumUrl}/search.json?q=${encodeURIComponent(query)}`);
      return (
        data.topics?.slice(0, 10).map((t: any) => ({
          id: t.id,
          title: t.title,
          created_at: t.created_at,
          posts_count: t.posts_count,
        })) || []
      );
    } catch {
      return [];
    }
  },
};
