import Link from "next/link";
import { db } from "~/server/db";
const mockUrl =
  "https://2phtlup0un.ufs.sh/f/v3cRVdYWPt5c9ySvF46q3SoczUCJgYjp0H8kDhGL1uZ2a5Xs";
export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log(posts);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
      <h1 className="text-5xl font-extrabold">
        Welcome to the Home Page for my 2005 sti
      </h1>
      <img
        src={mockUrl}
        alt="Car Image"
        className="my-8 w-1/2 rounded-lg shadow-lg"
      />
    </main>
  );
}
