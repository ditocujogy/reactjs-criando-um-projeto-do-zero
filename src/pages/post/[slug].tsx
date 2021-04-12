import { ReactElement } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
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
        </div>

        <div className={styles.post}>
          {post.data.content.map(content => (
            <div key={content.heading} className={styles.contentText}>
              <h1 className={styles.contentTitle}>{content.heading}</h1>
              {content.body.map(p => (
                <p key={p.text}>{p.text}</p>
              ))}
            </div>
          ))}
        </div>

        <Comments />
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

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
    },
  };
};
