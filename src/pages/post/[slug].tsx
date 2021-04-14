import { ReactElement } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { RichText } from 'prismic-dom';
import format from 'date-fns/format';
import ptBr from 'date-fns/locale/pt-BR';

import Header from '../../components/Header';
import Comments from '../../components/Comments';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface SidePost {
  slug: string;
  title: string;
}

interface PostProps {
  post: Post;
  preview: boolean;
  updatedPreviousPost: SidePost | null;
  updatedNextPost: SidePost | null;
}

export default function Post({
  post,
  preview,
  updatedPreviousPost,
  updatedNextPost,
}: PostProps): ReactElement {
  const router = useRouter();

  function calculateReadingTime(): string {
    const stringArray = post.data.content.reduce(
      (acc, actual) => {
        const body = RichText.asText(actual.body);
        const eachContent = body.concat(actual.heading);

        const newArray = eachContent.split(/[,.\s;\t\n\r]/);
        return [...acc, ...newArray];
      },
      ['']
    );

    const words = stringArray.length;
    const media = Math.ceil(words / 200);

    return `${media} min`;
  }

  const readingTime = calculateReadingTime();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt="banner" />
      </div>
      <div className={styles.content}>
        <div className={styles.info}>
          <h1>{post.data.title}</h1>

          <FiCalendar size={20} />
          <time>
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBr,
            })}
          </time>
          <FiUser size={20} />
          <span>{post.data.author}</span>
          <FiClock size={20} />
          <span>{readingTime}</span>

          {post.last_publication_date && (
            <i>
              {format(
                new Date(post.last_publication_date),
                "'*editado em 'dd MMM yyyy', às 'kk:mm",
                {
                  locale: ptBr,
                }
              )}
            </i>
          )}
        </div>

        <div>
          {post.data.content.map(content => (
            <div key={content.heading} className={styles.contentText}>
              <h1 className={styles.contentTitle}>{content.heading}</h1>
              {content.body.map(p => (
                <p key={p.text}>{p.text}</p>
              ))}
            </div>
          ))}
        </div>

        <div className={styles.sidePosts}>
          {updatedPreviousPost && (
            <Link href={`/post/${updatedPreviousPost.slug}`}>
              <a>
                <h3>{updatedPreviousPost.title}</h3>
                <p>Post anterior</p>
              </a>
            </Link>
          )}
          {updatedNextPost && (
            <Link href={`/post/${updatedNextPost?.slug}`}>
              <a>
                <h3>{updatedNextPost.title}</h3>
                <p>Próximo post</p>
              </a>
            </Link>
          )}
        </div>

        <Comments />

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps> = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const postsResponse = await prismic.query('', {
    pageSize: 4,
    ref: previewData?.ref ?? null,
  });

  let thisPostIndex = -1;

  for (let i = 0; i < postsResponse.results.length; i += 1) {
    if (postsResponse.results[i].id === response.id) {
      thisPostIndex = i;
    }
  }

  let previousPost = null;
  let nextPost = null;

  if (thisPostIndex !== -1) {
    if (thisPostIndex < postsResponse.results.length - 1) {
      previousPost = postsResponse.results[thisPostIndex + 1];
    }
    if (thisPostIndex !== 0) {
      nextPost = postsResponse.results[thisPostIndex - 1];
    }
  }

  const updatedPreviousPost =
    previousPost === null
      ? null
      : {
        slug: previousPost?.uid,
        title: previousPost?.data?.title,
      };

  const updatedNextPost =
    nextPost === null
      ? null
      : {
        slug: nextPost?.uid,
        title: nextPost?.data?.title,
      };

  // const post = {
  //   first_publication_date: format(
  //     new Date(response.first_publication_date),
  //     'dd MMM yyyy',
  //     {
  //       locale: ptBr,
  //     }
  //   ),
  //   data: {
  //     title: response.data.title,
  //     banner: {
  //       url: response.data.banner.url,
  //     },
  //     author: response.data.author,
  //     content: response.data.content.map(section => {
  //       return {
  //         heading: section.heading,
  //         body: section.body.map(p => {
  //           return {
  //             text: p.text,
  //           };
  //         }),
  //       };
  //     }),
  //   },
  // };

  // function calculateReadingTime(): string {
  //   const stringArray = response.data.content.reduce(
  //     (acc, actual) => {
  //       const body = RichText.asText(actual.body);
  //       const eachContent = body.concat(actual.heading);

  //       const newArray = eachContent.split(/[,.\s;\t\n\r]/);
  //       return [...acc, ...newArray];
  //     },
  //     ['']
  //   );

  //   const words = stringArray.length;
  //   const media = Math.ceil(words / 200);

  //   return `${media} min`;
  // }

  // const readingTime = calculateReadingTime();

  return {
    props: {
      post: response,
      preview,
      updatedPreviousPost,
      updatedNextPost,
    },
  };
};
