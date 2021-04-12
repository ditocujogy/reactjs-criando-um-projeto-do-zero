import { ReactElement, useState } from 'react';

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMorePosts(): Promise<void> {
    const data = await fetch(postsPagination.next_page).then(response =>
      response.json()
    );

    const newPosts = data.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts([...posts, ...newPosts]);
    setNextPage(data.next_page);
  }

  return (
    <>
      <Head>
        <title>Posts | SpaceTraveling</title>
      </Head>

      <div className={styles.container}>
        <Image src="/logo.svg" alt="logo" width={238.62} height={25.63} />

        <div className={styles.posts}>
          {posts.map(post => {
            return (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a className={styles.post}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>

                  <FiCalendar size={20} />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBr }
                    )}
                  </time>
                  <FiUser size={20} />
                  <span>{post.data.author}</span>
                </a>
              </Link>
            );
          })}
        </div>

        {nextPage ? (
          <button type="button" onClick={handleLoadMorePosts}>
            Carregar mais posts
          </button>
        ) : (
          ''
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', { pageSize: 1 });

  // const postsPagination = {
  //   next_page: postsResponse.next_page,
  //   results: postsResponse.results.map(post => {
  //     return {
  //       uid: post.uid,
  //       first_publication_date: format(
  //         new Date(post.first_publication_date),
  //         'dd MMM yyyy',
  //         {
  //           locale: ptBr,
  //         }
  //       ),
  //       data: {
  //         title: post.data.title,
  //         subtitle: post.data.subtitle,
  //         author: post.data.author,
  //       },
  //     };
  //   }),
  // };

  return {
    props: {
      postsPagination: postsResponse,
    },
    revalidate: 60 * 10,
  };
};
