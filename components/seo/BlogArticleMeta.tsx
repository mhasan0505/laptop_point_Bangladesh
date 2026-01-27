interface BlogMetaProps {
  title: string;
  description: string;
  image: string;
  author?: string;
  publishedDate: string;
  updatedDate?: string;
  url: string;
}

export const BlogArticleMeta: React.FC<BlogMetaProps> = ({
  title,
  description,
  image,
  author = "Laptop Point Bangladesh",
  publishedDate,
  updatedDate,
  url,
}) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: description,
          image: image,
          datePublished: publishedDate,
          dateModified: updatedDate || publishedDate,
          author: {
            "@type": "Organization",
            name: author,
            url: "https://laptoppointbd.com",
            logo: {
              "@type": "ImageObject",
              url: "https://laptoppointbd.com/logo.png",
            },
          },
          publisher: {
            "@type": "Organization",
            name: author,
            logo: {
              "@type": "ImageObject",
              url: "https://laptoppointbd.com/logo.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
          },
        }),
      }}
    />
  );
};

export default BlogArticleMeta;
