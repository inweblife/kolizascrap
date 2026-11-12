import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/Blog.module.css";
import blogPosts from "../../data/blog-posts.json";
import { sanitize } from "../../lib/sanitize";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  excerpt_plain: string;
  content: string;
  image?: string;
  date: string;
  author: string;
}

export async function getStaticProps(context: { params: { id: string } }) {
  const post = (blogPosts as BlogPost[]).find(
    (post) => post.slug === context.params.id
  );

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const paths = (blogPosts as BlogPost[]).map((post) => ({
    params: { id: post.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

interface PostPageProps {
  post: BlogPost;
}

export default function BlogPost({ post }: PostPageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://kolizascrap.vercel.app";
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;
  const ogImage = post.image ? `${baseUrl}${post.image}` : `${baseUrl}/mercedes.webp`;

  // Find previous and next posts sorted by date descending
  const sortedPosts = [...(blogPosts as BlogPost[])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentIndex = sortedPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  return (
    <>
      <Head>
        <title>{post.title} | Коли за скрап</title>
        <meta name="description" content={post.excerpt_plain} />
        <meta name="keywords" content={`${post.title}, коли за скрап, бракуване на автомобили, изкупуване на коли София`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${post.title} | Коли за скрап`} />
        <meta property="og:description" content={post.excerpt_plain} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:modified_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content="Автомобили" />
        <meta name="twitter:title" content={`${post.title} | Коли за скрап`} />
        <meta name="twitter:description" content={post.excerpt_plain} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Начало", "item": baseUrl },
                { "@type": "ListItem", "position": 2, "name": "Блог", "item": `${baseUrl}/blog` },
                { "@type": "ListItem", "position": 3, "name": post.title, "item": canonicalUrl }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt_plain,
              "author": {
                "@type": "Person",
                "name": post.author
              },
              "datePublished": post.date,
              "dateModified": post.date,
              "url": canonicalUrl,
              "image": ogImage,
              "publisher": {
                "@type": "Organization",
                "name": "Коли за скрап София",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${baseUrl}/mercedes.webp`
                }
              }
            })
          }}
        />
      </Head>

      <main className={styles.blogPostMain}>
        <div className={styles.postHeader}>
          <Link href="/blog" aria-label="Назад към блога">← Назад към блога</Link>
          <h1>{post.title}</h1>
          <div className={styles.postMeta}>
            <span className={styles.author}>{post.author}</span>
            <span className={styles.date}>{post.date}</span>
          </div>
        </div>

        <article className={styles.postContent}>
          {post.image && (
            <div className={styles.postImage}>
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(min-width: 45em) 800px, 100vw"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: sanitize(post.content) }} />
          {post.slug === "bezplaten-transport-izkupuvane-na-koli" && (
            <p>
              <a
                href="https://seo-optimizacia.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong>SEO оптимизация</strong>
              </a>
            </p>
          )}
        </article>

        {/* Previous/Next Post Navigation */}
        <nav className={styles.postNavigation}>
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`} className={styles.navLink}>
              ← Предишен: {prevPost.title}
            </Link>
          ) : (
            <span></span>
          )}
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`} className={styles.navLink}>
              Следващ: {nextPost.title} →
            </Link>
          ) : (
            <span></span>
          )}
        </nav>
      </main>
    </>
  );
}
