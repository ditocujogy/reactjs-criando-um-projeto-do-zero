import React, { ReactElement, useEffect, useRef } from 'react';

export default function Comments(): ReactElement {
  const commentBox = useRef(null);

  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', 'true');
    scriptEl.setAttribute(
      'repo',
      'ditocujogy/reactjs-criando-um-projeto-do-zero'
    );
    scriptEl.setAttribute('issue-term', 'pathname');
    scriptEl.setAttribute('theme', 'github-dark');

    commentBox.current.appendChild(scriptEl);
  }, []);

  return <div ref={commentBox} className="comment-box"></div>;
}
