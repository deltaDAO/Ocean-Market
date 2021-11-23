import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
import styles from './Boxes.module.css'
import { ReactComponent as LogoWaves } from '../../../images/waves.svg'

const contentQuery = graphql`
  query BoxQuery {
    file(relativePath: { eq: "pages/home/intro.json" }) {
      childHomeJson {
        boxes {
          title
          body
        }
      }
    }
  }
`

interface Box {
  title: string
  body: string
}

export default function Boxes(): ReactElement {
  const data = useStaticQuery(contentQuery)
  const { boxes } = data.file.childHomeJson

  return (
    <div className={styles.container}>
      <LogoWaves className={styles.waves} />
      <div className={styles.list}>
        {boxes.map((box: Box, i: number) => (
          <div className={styles.box} key={i}>
            <h3>{box.title}</h3>
            <p>{box.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
