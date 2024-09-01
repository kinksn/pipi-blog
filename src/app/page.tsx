import PostCard from "@/components/PostCard";
import { GET } from "@/app/api/post/route";
import { GetPostOutput } from "@/app/api/post/model";

export default async function Home() {
  const posts: GetPostOutput[] = await (await GET()).json();

  return (
    <main className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
      {posts.map((post) => (
        <PostCard post={post} key={post.id} />
      ))}
    </main>
  );
}