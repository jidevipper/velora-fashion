import Link from "next/link";

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="placeholder-page">
      <h1>{title}</h1>
      <p>{description}</p>
      <Link href="/" className="btn">
        Back to Home
      </Link>
    </main>
  );
}
