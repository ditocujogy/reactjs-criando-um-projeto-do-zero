import { ReactElement } from 'react';

import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <div className={styles.container}>
      <Link href="/">
        <a>
          <Image src="/logo.svg" alt="logo" width={238.62} height={25.63} />
        </a>
      </Link>
    </div>
  );
}
