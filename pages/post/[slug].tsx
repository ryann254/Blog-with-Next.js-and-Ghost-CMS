import Link from 'next/link'
import {useRouter} from 'next/router'
import { useState } from 'react'
import styles from '../../styles/Home.module.scss'

const {CONTENT_API_KEY, BLOG_URL} = process.env

type Post = {
    title: string
    slug: string
    html: string
}

async function getPost(slug: string) {
    const res = await fetch(`${BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}?key=${CONTENT_API_KEY}&fields=title,slug,html`)
  .then((res) => res.json())

    const posts = res.posts
  
    return posts[0]
  }
  
export const getStaticProps = async ({params}) => {
const post = await getPost(params.slug)

return {
    props: {post},
    revalidate: 10
}
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: true
    }
}

const Post:React.FC<{post: Post}> = props => {
    const {post} = props
    const [enableLoadComments, setEnableLoadComments] = useState<boolean>(true)
    const router = useRouter()
    if(router.isFallback) {
        return <h2>Loading...here</h2>
    }

    const loadComments = () => {
        setEnableLoadComments(false);
        if (document.getElementById('disqus_thread')) {
            (window as any).disqus_config = function () {
                this.page.url = window.location.href;  // Replace PAGE_URL with your page's canonical URL variable
                this.page.identifier = post.slug; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
            };

            const pageScript = document.createElement('script');
            pageScript.src = 'https://ghost-nextjs.disqus.com/embed.js';
            pageScript.setAttribute('data-timestamp', Date.now().toString());
            document.body.appendChild(pageScript);  
    }                     
    }

    return <div className={styles.container}>
        <Link href="/"><a className={styles.goBack}>Go Back</a></Link>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{__html: post.html}}></div>
        {enableLoadComments && (
        <div onClick={loadComments} className={styles.loadComments}>
            Load Comments
        </div>)}
        <div id="disqus_thread" className={styles.discuss}></div>
    </div>
}

export default Post